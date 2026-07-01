const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// 1. Setup CORS yang benar
app.use(cors({
  origin: ['https://cari-makan-frontend.vercel.app', 'https://cari-makan-frontend2.vercel.app'], 
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// ─── Endpoint: Pencarian Makanan (PERBAIKAN) ──────────────────────────────────
app.get('/api/foods/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    // PANGGIL API THEMEALDB, BUKAN BACKEND SENDIRI
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching foods:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

// ─── Endpoint: Detail Makanan ──────────────────────────────────────────────────
app.get('/api/foods/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    
    // ... (sisa fungsi translate Anda tetap sama)
    const meal = response.data.meals ? response.data.meals[0] : null;
    if (!meal) return res.status(404).json({ message: "Makanan tidak ditemukan" });

    const [translatedInstructions, translatedMeal] = await Promise.all([
      translateText(meal.strInstructions),
      translateIngredients(meal)
    ]);

    translatedMeal.strInstructions = translatedInstructions;
    res.json({ meals: [translatedMeal] });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = app;