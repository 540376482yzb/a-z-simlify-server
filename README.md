### Simlify Server

**♪ Sul Sul!** Simlify is an app that teaches Simlish using spaced repetition. Simlish is a fictional language featured in The Sims, a video-game franchise by EA Games.

[demo app](https://simlish.herokuapp.com/)

### Avalible RESTful APIs

* GET request on `/simlish/generate` (initialize and return 10 random question sets)
* GET request on `/simlish/question` (return current question)
* POST request on `/simlish/answer` (return question answer pairs and feedback)
  ```
    exmaple input:
    {
        "answer": "Hello"
    }
    exmaple output:
    {
       "question": "sul sul",
       "answer": "Hello",
       "status": "good"
    }
  ```
