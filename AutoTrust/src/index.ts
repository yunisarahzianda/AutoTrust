import { v4 as uuidv4 } from "uuid";
import { StableBTreeMap } from "azle";
import express from "express";
import { time } from "azle";

/**
 * StableBTreeMap digunakan untuk menyimpan data mobil bekas di blockchain.
 * - Key: ID mobil (string)
 * - Value: Informasi mobil (Mobil)
 */

class Mobil {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  owner: string;
  history: string[]; // Riwayat verifikasi mobil
  createdAt: Date;
  updatedAt: Date | null;
}

const mobilStorage = StableBTreeMap<string, Mobil>(0);

const app = express();
app.use(express.json());

// Menambahkan mobil baru ke marketplace
app.post("/cars", (req, res) => {
  const mobil: Mobil = {
    id: uuidv4(),
    createdAt: getCurrentDate(),
    updatedAt: null,
    history: [],
    ...req.body,
  };
  mobilStorage.insert(mobil.id, mobil);
  res.json(mobil);
});

// Melihat semua mobil di marketplace
app.get("/cars", (req, res) => {
  res.json(mobilStorage.values());
});

// Melihat detail mobil berdasarkan ID
app.get("/cars/:id", (req, res) => {
  const carId = req.params.id;
  const carOpt = mobilStorage.get(carId);
  if (!carOpt) {
    res.status(404).send(`Car with id=${carId} not found`);
  } else {
    res.json(carOpt);
  }
});

// Memperbarui data mobil
app.put("/cars/:id", (req, res) => {
  const carId = req.params.id;
  const carOpt = mobilStorage.get(carId);
  if (!carOpt) {
    res.status(400).send(`Car with id=${carId} not found`);
  } else {
    const car = carOpt;
    const updatedCar = {
      ...car,
      ...req.body,
      updatedAt: getCurrentDate(),
    };
    mobilStorage.insert(car.id, updatedCar);
    res.json(updatedCar);
  }
});

// Menambahkan riwayat verifikasi mobil
app.post("/cars/:id/verify", (req, res) => {
  const carId = req.params.id;
  const carOpt = mobilStorage.get(carId);
  if (!carOpt) {
    res.status(404).send(`Car with id=${carId} not found`);
  } else {
    const car = carOpt;
    car.history.push(req.body.verification);
    mobilStorage.insert(car.id, car);
    res.json(car);
  }
});

// Menghapus mobil dari marketplace
app.delete("/cars/:id", (req, res) => {
  const carId = req.params.id;
  const deletedCar = mobilStorage.remove(carId);
  if (!deletedCar) {
    res.status(400).send(`Car with id=${carId} not found`);
  } else {
    res.json(deletedCar);
  }
});

app.listen();

function getCurrentDate() {
  const timestamp = Number(time());
  return new Date(timestamp.valueOf() / 1_000_000);
}
