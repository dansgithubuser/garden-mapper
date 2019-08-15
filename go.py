import os
import sys

DIR = os.path.dirname(os.path.realpath(__file__))
sys.path.append(os.path.join(DIR, 'deps'))

import djangogo

parser = djangogo.make_parser()
args = parser.parse_args()
djangogo.main(args,
    project='proj_garden_mapper',
    app='garden_mapper',
    db_name='db_garden_mapper',
    db_user='u_garden_mapper',
    heroku_url='https://garden-mapper.herokuapp.com/',
    heroku_repo='https://git.heroku.com/garden-mapper.git',
)
