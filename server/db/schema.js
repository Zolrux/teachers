const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const teachers = new Schema({
    name: String,
    surname: String,
    patronymic: String,
    imagePath: String
});

const statistic = new Schema({
    teacher: { 
        type: Schema.Types.ObjectId, 
        ref: 'Teacher'
    },
    classicMode: {
        wins: {type: Number, default: 0},
        selectedCount: {type: Number, default: 0}
    },
    mountainMode: {
        wins: {type: Number, default: 0},
        selectedCount: {type: Number, default: 0}
    }
});

const Teacher = mongoose.model('Teacher', teachers);
const Statistic = mongoose.model('Statistic', statistic);

module.exports = { Teacher, Statistic };