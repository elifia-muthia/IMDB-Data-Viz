import os
import csv
import requests
import json
import cv2
from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_heroku import Heroku
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, cast, Numeric
import pandas as pd
from flask_bootstrap import Bootstrap
from models import db, IMDB2
from  sqlalchemy.sql.expression import func, select
from sklearn.metrics import mean_squared_error, r2_score
from sklearn import datasets, linear_model
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt
from OpenCV.dom_color import rgb_to_hex, find_histogram
from werkzeug import secure_filename
from sklearn.cluster import KMeans
import numpy as np
from ast import literal_eval


app = Flask(__name__)
Bootstrap(app)
aws_datastore = 'postgresql://master:password@imdbvis.ch6omdjvbibr.us-west-2.rds.amazonaws.com/movie'

app.config['SQLALCHEMY_DATABASE_URI'] = aws_datastore
db = SQLAlchemy(app)

#TODO : Secure key
SECRET_KEY = os.urandom(32)
app.config['SECRET_KEY'] = SECRET_KEY

#from sklearn.model_selection import train_test_split
## getting data from csv
#parsing the dominant colors array
def parse_dom(raw_colors):
    colors = []
    for j in range(len(raw_colors)):
        movie_colors = []
        start = 0
        hexValue = ''
        numValue = 0

        try:
            for i in range(len(raw_colors[j])):
                if raw_colors[j][i] == '#':
                    hexValue = raw_colors[j][i:i+7]
                elif raw_colors[j][i] == '.':
                    start = i
                if raw_colors[j][i] == ']' and start != 0:
                    numValue = float(raw_colors[j][start:i])
                    temp = [hexValue, numValue]
                    start = 0
                    movie_colors.append(temp)
            colors.append(movie_colors)
        except:
            colors.append([])

    return colors

#parsing the parent colors array


def parse_par(raw_colors):
    colors = []
    for i in range(len(raw_colors)):
        colors.append(literal_eval(raw_colors[i]))
    return colors

#getting the parent rgb for each movie dominant color


def get_par_values(dom, parent):
    arr = []
    for i in range(len(dom)):
        dominant_index = 0
        highest_val = 0
        for j in range(len(dom[i])):
            if dom[i][j][1] >= highest_val:
                dominant_index = j
                highest_val = dom[i][j][1]
        arr.append(parent[i][dominant_index])
    return arr


data = pd.read_csv('./prediction_models/movie_data.csv')
dom_colors = parse_dom(data['dominant_colors_array'].values)

parent_colors = parse_par(data['rgb_parent_colors'].values)
imdb_scores = data['imdb_score'].values
par_values = get_par_values(dom_colors, parent_colors)
budget = data['budget'].values

## dividing the movies based on their genres

#parsing genre array

def parse_genres(genres):
    arr = []
    for i in range(len(genres)):
        arr.append(genres[i].split('|'))
    return arr

#finding out the unique genres accross all movies


def get_unique_genres(genres):
    arr = []
    for i in range(len(genres)):
        for j in range(len(genres[i])):
            exist = False
            for k in range(len(arr)):
                if genres[i][j] == arr[k]:
                    exist = True
            if exist == False:
                arr.append(genres[i][j])
    return arr

#groups movies into their genres in a dictionary
#movies can overlap between genres
#movies are defined by their parent rgb of their dominant color (index 0) and their imdb score (index 1)


def group_genres(movie_genres, values, imdb_scores, budget):
    #     print(values)
    genre_dict = {i: [] for i in get_unique_genres(movie_genres)}
    for i in range(len(movie_genres)):
        for j in range(len(movie_genres[i])):
            if budget[i] > 0:
                arr = [values[i], imdb_scores[i]]
                genre_dict[movie_genres[i][j]].append(arr)
    return genre_dict


movie_genres = parse_genres(data['genres'].values)


#ready to split into training and test set for each genre
genre_dict = group_genres(movie_genres, par_values, imdb_scores, budget)
# print(genre_dict) # color: [0], imdb: [1], budget: [2]


## genre_dict is the genre dictionary made previously, genre is a string specifying the model of the genre## genre
## and rgb value of the movie poster uploaded by user
## genre example: 'Action'
def getPrediction1(genre_dict, genre, rgb_color):
    rgb = []
    score = []
    for i in range(len(genre_dict[genre])):
        rgb.append(genre_dict[genre][i][0])
        score.append(genre_dict[genre][i][1])

    parent_rgb = getParentRGB(rgb_color)

    colors_train, colors_test, score_train, score_test = train_test_split(
        rgb, score, test_size=0.10, random_state=50)
    regr = linear_model.LinearRegression()
    regr.fit(colors_train, score_train)

    scores_pred = regr.predict(colors_test)
    ## since the score prediction are limited to a certain range, a linspace is made so that it is spread out in a 1-10 scale
    # get a prediction for our input value
    # find the closest number in our linspace
    # find the index where that closest number is
    # score = index/10
    x = np.linspace(min(scores_pred), max(scores_pred), 100)
    pred = regr.predict([parent_rgb])
    closest = min(x, key=lambda l: abs(l-pred))
    result = np.where(x == closest)
    return result[0]/10

## assigning the rgb color of the movie into a parent rgb


def getParentRGB(rgb_color):
    palette = [(128, 0, 0), (200, 0, 0), (255, 0, 0), (255, 128, 0), (255, 163, 51), (255, 255, 0), (238, 221, 130), (128, 255, 0), (0, 255, 0), (0, 100, 0), (0, 75, 0),
               (0, 255, 128), (0, 255, 255), (0, 128, 255), (75, 0, 130), (173,
                                                                           216, 230), (0, 0, 255), (0, 0, 128), (128, 0, 255), (255, 0, 255),
               (255, 0, 128), (255, 218, 185), (0, 0, 0), (255, 255, 255), (63, 0, 0), (0, 0, 63), (57, 0, 114), (222, 184, 135), (1, 50, 32), (134, 197, 218), (72, 36, 10), (50, 25, 7)]

    r = rgb_color[0]
    g = rgb_color[1]
    b = rgb_color[2]

    lowest_diff = 255*3
    closest_color = []

    for j in range(len(palette)):
        r_diff = np.sqrt(np.power((palette[j][0] - r), 2))
        g_diff = np.sqrt(np.power((palette[j][1] - g), 2))
        b_diff = np.sqrt(np.power((palette[j][2] - b), 2))
        total_diff = (r_diff + g_diff + b_diff)/3

        if total_diff <= lowest_diff:
            closest_color = palette[j]
            lowest_diff = total_diff

    return closest_color

# index route
@app.route("/")
def index():
    return render_template("index.html")

@app.route('/load_all_data', methods=['GET'])
def load_all_data(): 
  movies_all_json = {'movies': []}
  movies = IMDB2.query.all()
  for movie in movies:
    movie_info = movie.__dict__
    del movie_info['_sa_instance_state']
    movies_all_json['movies'].append(movie_info)
  return jsonify(movies_all_json)

@app.route('/load_top_data', methods=['GET'])
def load_top_data(): 
  movies_json = {'movies': []}
  movies = IMDB2.query.order_by(cast(IMDB2.gross, Numeric).desc()).filter(IMDB2.gross != "NaN").limit(100)
  for movie in movies:
    movie_info = movie.__dict__
    del movie_info['_sa_instance_state']
    movies_json['movies'].append(movie_info)
  return jsonify(movies_json)

@app.route('/load_genre_data/<genre>', methods=['GET'])
def load_genre_data(genre): 
  movies_genre_json = {'movies': []}
  movies = IMDB2.query.filter(IMDB2.genres.ilike("%{0}%".format(genre))).order_by(cast(IMDB2.gross, Numeric).desc()).filter(IMDB2.gross != "NaN").limit(100)
  for movie in movies:
    movie_info = movie.__dict__
    del movie_info['_sa_instance_state']
    movies_genre_json['movies'].append(movie_info)
  return jsonify(movies_genre_json)

@app.route('/load_intro_data', methods=['GET'])
def load_intro_data(): 
  intro_movies_json = {'movies': []}
  movies = IMDB2.query.order_by(func.random()).limit(12)
  for movie in movies:
    movie_info = movie.__dict__
    del movie_info['_sa_instance_state']
    intro_movies_json['movies'].append(movie_info)
  return jsonify(intro_movies_json)

@app.route('/user_movie', methods=['POST'])
def user_movie():
  img = request.form.get('pic')
  genre = request.form.get('genreDropdown')
  
  if img not in request.files:

    f = request.files['image']
    f.save(secure_filename(f.filename))
    print(f.filename)
    # reading image
    img = cv2.imread(f.filename)
    # converting color from BGR to RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  
    # reshaping to a list of pixels, represent as row*column,channel number
    img = img.reshape((img.shape[0] * img.shape[1], 3))
    kmeans = KMeans(n_clusters=3)  # cluster number
    kmeans.fit(img)
    hist = find_histogram(kmeans)
    colors = kmeans.cluster_centers_.astype(int)
  
    maximum = np.max(hist)
    index_of_maximum = np.where(hist == maximum)

  

    rgbTuple = tuple(colors[index_of_maximum][0])
    genre = "{}".format(genre)
    score = float(getPrediction1(genre_dict, genre, rgbTuple))

  return render_template("index.html", score=score, genre=genre, formSubmit=True)


# @app.route('/user_movie_data', methods=['GET'])
# def user_movie_data():
#   print()


if __name__ == "__main__":
    app.run(debug=True)
