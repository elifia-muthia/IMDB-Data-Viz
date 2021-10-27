from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects import postgresql

db = SQLAlchemy()

class IMDB2(db.Model):
    __tablename__ = 'imdb'
    movie_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    movie_imdb_lnk = db.Column(db.String(300), nullable=False)
    movie_title = db.Column(db.String(200), nullable=False)
    plot_keywords= db.Column(db.String(200), nullable=False)
    language= db.Column(db.String(200), nullable=False)
    country= db.Column(db.String(64), nullable=False)
    genres = db.Column(db.String(200), nullable=False)
    gross = db.Column(db.Integer, nullable=False)
    content_rating = db.Column(db.String(64), nullable=False)
    budget = db.Column(db.Integer, nullable=False)
    title_year = db.Column(db.String(4), nullable=False)
    director_name = db.Column(db.String(200), nullable=False)
    duration = db.Column(db.String(200), nullable=False)
    imdb_score = db.Column(db.String(10), nullable=False)
    image_path = db.Column(db.String(300), nullable=False)
    image_url = db.Column(db.String(300), nullable=False)
    dominant_color = db.Column(db.String(200), nullable=True)
    dominant_colors_array = db.Column(db.String(200), nullable=True)
    rgb_dominant_colors = db.Column(postgresql.ARRAY(db.Integer, dimensions=2), nullable=True)
    rgb_parent_colors = db.Column(postgresql.ARRAY(db.Integer, dimensions=2), nullable=True)

