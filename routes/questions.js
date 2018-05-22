'use strict'

const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwtDecode = require('jwt-decode')
const {
  SingleLinkedList,
  insertAt,
  createWord,
  insertLast,
  convertToArray,
  getSize
} = require('../ds/SLL')
const questions = require('../db/seed/wordbank.json')

function getUsername(request) {
  const authToken = request.headers.authorization.split(' ')[1]
  const currentUser = jwtDecode(authToken).user.username
  return currentUser
}
// return random 10 wordpairs
function getRandomWords(questions, size) {
  const max = questions.length
  const result = []
  const indexArr = []
  let index = null
  let wordPair = null
  while (result.length < size) {
    index = Math.floor(Math.random() * max)
    wordPair = questions[index]
    if (!indexArr.includes(index)) {
      indexArr.push(index)
      result.push(wordPair)
    }
  }
  return result
}

router.get('/generate', (req, res, next) => {
  const username = getUsername(req)
  let sll = new SingleLinkedList()
  User.findOne({ 'local.username': username })
    .then(user => {
      user.local.words = sll
      // add math.random to grab random group of words from the array
      const questionSet = getRandomWords(questions, 10)
      questionSet.forEach(word => sll.insertFirst(word))
      return User.findOneAndUpdate(
        { 'local.username': username },
        { 'local.words': user.local.words },
        { new: true }
      )
    })
    .then(result => {
      if (!result) {
        throw new Error('Could not generate words for user')
      }
      return res.json(result)
    })
    .catch(err => next(err))
})

router.get('/question', (req, res, next) => {
  const username = getUsername(req)
  User.findOne({ 'local.username': username }).then(user => {
    if (!user) {
      const err = new Error('User did not find')
      err.status = 404
      return next(err)
    }
    let question
    const { head } = user.local.words
    if (!head) {
      question = null
    }
    question = user.local.words.head.question
    const { grade, experience } = user.local
    return res.status(200).json({ question, grade, experience })
  })
})

router.post('/answer', (req, res, next) => {
  let { answer } = req.body
  const username = getUsername(req)
  let feedback = null

  User.findOne({ 'local.username': username })
    .then(user => {
      // todo: selections of feedbacks

      const words = user.local.words
      const currentWord = words.head
      let mIndex = words.head.M
      let exp = Number(user.local.experience)
      let grade = Number(user.local.grade)
      let carrier = 0
      // console.log(answer)
      if (answer.toLowerCase() === currentWord.answer.toLowerCase()) {
        feedback = { status: 'good', answer, correctAnswer: currentWord.answer }
        words.head.M *= 2
        exp = exp + 10
        if (exp >= 100) {
          carrier = 1
          exp = exp - 100
        }
      } else {
        words.head.inCorrect += 1
        words.head.M = 2
        feedback = { status: 'bad', answer, correctAnswer: currentWord.answer }
      }
      words.head.totalAttempt += 1
      insertAt(words, currentWord, mIndex)
      return User.findOneAndUpdate(
        { 'local.username': username },
        { 'local.words': words, 'local.experience': exp, 'local.grade': grade + carrier },
        { new: true }
      )
    })
    .then(() => {
      return res.json(feedback)
    })
    .catch(err => {
      next(err)
    })
})

router.get('/report', (req, res, next) => {
  const userName = getUsername(req)
  let report = null
  User.findOne({ 'local.username': userName })
    .then(user => {
      if (!user) {
        const err = new Error('no such user')
        err.status = 400
        return next(err)
      }
      const words = user.local.words
      report = convertToArray(words)
      res.json(report)
    })
    .catch(err => next(err))
})

module.exports = router
