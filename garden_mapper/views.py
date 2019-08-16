from . import models

from django.contrib.auth import authenticate, login
from django.contrib.auth.forms import UserCreationForm
from django.db.models.fields.related import ForeignKey
from django.forms.models import model_to_dict
from django.http import JsonResponse, HttpResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt

import inspect
import json

@csrf_exempt
def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('/')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})

def _crudify(name, model):
    # helpers
    def h_fields(model=model):
        return {i.name: i for i in model._meta.fields}
    def h_filter(params):
        return {k: v for k, v in params.items() if k in h_fields()}
    def h_params(request, method='POST'):
        if method == 'POST':
            params = json.loads(request.body.decode())
        elif method == 'GET':
            params = dict(**request.GET)
        else: raise Exception('no such method')
        params['user'] = request.user.id
        return h_filter(params)
    def h_permitted(instance, request):
        if 'user' in h_fields(instance): return request.user == instance.user
        for field_name, field in h_fields(instance).items():
            if isinstance(field, ForeignKey):
                return h_permitted(getattr(instance, field_name), request)
    def h_writify(params):
        fields = h_fields()
        return {
            (k+'_id' if isinstance(fields[k], ForeignKey) else k): v
            for k, v
            in params.items()
        }
    # crud
    def create(request):
        params = h_params(request)
        instance = model(**h_writify(params))
        if not h_permitted(instance, request): return HttpResponse(status=404)
        instance.save()
        return JsonResponse({'id': instance.id}, status=201)
    def retrieve(request):
        params = h_params(request, 'GET')
        if 'id' in params:
            instance = model.objects.get(params['id'])
            if not h_permitted(instance, request): return HttpResponse(status=404)
            return JsonResponse({'item': model_to_dict(instance)})
        else:
            for field_name, field in h_fields().items():
                if field_name in params:
                    parent_model = getattr(models, field_name.capitalize())
                    parent = parent_model.objects.get(id=params[field_name])
                    if not h_permitted(parent, request): return HttpResponse(status=404)
                    params = {field_name: params[field_name]}
                    items = model.objects.filter(**params)
                    return JsonResponse({'items': [i for i in items.values()]})
            return HttpResponse(status=400)
    def update(request):
        params = h_params(request)
        instance = model.objects.get(params['id'])
        if not h_permitted(instance, request): return HttpResponse(status=404)
        model.objects.update(**h_writify(h_filter(request.POST)))
        return HttpResponse(status=204)
    def delete(request):
        params = h_params(request)
        instance = model.objects.get(params['id'])
        if not h_permitted(instance, request): return HttpResponse(status=404)
        instance.delete()
        return HttpResponse(status=204)
    # actualize
    for i in ['create', 'retrieve', 'update', 'delete']:
        globals()[name.lower()+'_'+i] = locals()[i]

for name, model in inspect.getmembers(models):
    if getattr(model, '__module__', None) != 'garden_mapper.models': continue
    if not issubclass(model, models.models.Model): continue
    _crudify(name, model)
