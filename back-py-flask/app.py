from flask import Flask
from flask_cors import CORS
# import sqlite3


app = Flask(__name__)
CORS(app)

output = [{
    'columns': ['unicode', 'mc'],
    'values': [
        ['2665', 'hello from Flask'],
        ['4F6F', 'jang,ziang'],
        ['5134', 'njang']
    ]
}]


@app.route('/demo_search', methods=['POST'])
def demo_search():
    return {'data': output}


@app.route('/test', methods=['GET'])
def test():
    return {'data': output}


if __name__ == '__main__':
    app.run()
