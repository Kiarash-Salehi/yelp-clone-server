if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const middlewares = require('./middlewares');
const morgan = require('morgan');
const db = require('./db');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(morgan('common'));
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.origin || '*' }));

app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
// app.get('/*', (req, res) => {
// 	res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
// });

// this
app.post('/api/v1/restaurants', async (req, res, next) => {
	try {
		const { rows: restaurants } = await db.query('SELECT * FROM restaurants');
		res.status(200).json({
			message: 'Get all restaurants',
			restaurants,
			results: restaurants.length
		});
	} catch (error) {
		next(error);
	}
});

//this
app.post('/api/v1/restaurants/add', async (req, res, next) => {
	try {
		const { name, location, price_range } = req.body;
		const {
			rows: restaurant
		} = await db.query('INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) returning *', [
			name,
			location,
			price_range
		]);
		res.status(200).json({
			message: 'Post request to all restaurants',
			restaurant: restaurant[0],
			results: restaurant.length
		});
	} catch (error) {
		next(error);
	}
});

// this
app.post('/api/v1/restaurants/:id', async (req, res, next) => {
	try {
		const { rows: restaurant } = await db.query(`SELECT * FROM restaurants WHERE id=$1`, [req.params.id]);
		const { rows: reviews } = await db.query(`SELECT * FROM reviews WHERE restaurant_id=$1`, [req.params.id]);
		res.status(200).json({
			message: 'Get one restaurant',
			restaurant: restaurant[0],
			reviews,
			results: { restaurants: restaurant.length, reviews: reviews.length }
		});
	} catch (error) {
		next(error);
	}
});

app.put('/api/v1/restaurants/:id', async (req, res, next) => {
	try {
		const { name, location, price_range } = req.body;
		const {
			rows: restaurant
		} = await db.query('UPDATE restaurants SET name=$1, location=$2, price_range=$3 WHERE id=$4 returning *', [
			name,
			location,
			price_range,
			req.params.id
		]);
		res.status(200).json({
			message: 'PUT request to one restaurant',
			id: req.params.id,
			restaurant: restaurant[0],
			body: req.body,
			results: restaurant.length
		});
	} catch (error) {
		next(error);
	}
});

app.delete('/api/v1/restaurants/:id', async (req, res, next) => {
	try {
		await db.query('DELETE FROM reviews WHERE restaurant_id=$1', [req.params.id]);
		await db.query('DELETE FROM restaurants WHERE id=$1', [req.params.id]);
		const { rows: restaurants } = await db.query('SElECT * FROM restaurants');
		res.status(200).json({
			message: 'DELETE request to one restaurant',
			id: req.params.id,
			restaurants,
			results: restaurants.length
		});
	} catch (error) {
		next(error);
	}
});

app.post('/api/v1/restaurants/:id/addReview', async (req, res, next) => {
	try {
		const { name, review, rating } = req.body;
		const { rows: newReview } = await db.query('INSERT INTO reviews (restaurant_id, name, review, rating) VALUES ($1, $2, $3, $4) returning *', [req.params.id, name, review, rating]);
		res.status(201).json({
			message: 'POST request to add review',
			id: req.params.id,
			review: newReview[0],
			results: review.length
		});
	} catch (error) {
		next(error);
	}
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

//app.listen(process.env.PORT);
app.listen(process.env.PORT, () => console.log(`App is running at port ${process.env.PORT}`));
