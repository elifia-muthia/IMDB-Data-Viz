
#Import csv to postgresql db

import psycopg2
import pandas as pd


aws_datastore = 'postgresql://master:password@imdbvis.ch6omdjvbibr.us-west-2.rds.amazonaws.com/movie'
#imdb_file = 'static/data/movie_data.csv'
imdb_file = 'movie_data.csv'
conn = psycopg2.connect(aws_datastore, sslmode='require')


cur = conn.cursor()

cur.execute("DROP TABLE IF EXISTS IMDB;")

cur.execute('''CREATE TABLE IMDB (
    movie_id INTEGER PRIMARY KEY NOT NULL,
    movie_imdb_lnk TEXT NOT NULL,
    movie_title TEXT NOT NULL,
    plot_keywords TEXT NOT NULL,
    language TEXT NOT NULL,
    country TEXT NOT NULL,
    genres TEXT NOT NULL,
    gross TEXT NOT NULL,
    content_rating TEXT NOT NULL,
    budget TEXT NOT NULL,
    title_year TEXT NOT NULL,
    director_name TEXT NOT NULL,
    duration TEXT NOT NULL,
    imdb_score TEXT NOT NULL,
    image_path TEXT NOT NULL,
    image_url TEXT NOT NULL,
    dominant_color TEXT NOT NULL,
    dominant_colors_array text[][],
    rgb_dominant_colors integer[3][3],
    rgb_parent_colors integer[3][3]);''')
    
conn.commit()


movies = pd.read_csv(imdb_file)
print(movies.columns)
for idx, movie in movies.iterrows():
    cur.execute('''INSERT INTO IMDB(movie_id,movie_imdb_lnk, movie_title, plot_keywords,language, country, genres, gross, content_rating, budget, title_year, director_name, duration, imdb_score, image_path, image_url, dominant_color, dominant_colors_array,rgb_dominant_colors,rgb_parent_colors) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)''', ( movie.movie_id,movie.movie_imdb_lnk ,movie.movie_title , movie.plot_keywords , movie.language ,movie.country, movie.genres, movie.gross ,movie.content_rating , movie.budget ,movie.title_year , movie.director_name ,movie.duration ,movie.imdb_score ,movie.image_path ,movie.image_url ,movie.dominant_color ,movie.dominant_colors_array,movie.rgb_dominant_colors,movie.rgb_parent_colors))
    conn.commit()

        


cur.close()
conn.close()
