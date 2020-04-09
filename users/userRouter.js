const express = require('express');

const UserDb = require('./userDb.js');
const PostDb = require('../posts/postDb.js');

const router = express.Router();

router.post('/', validateUser, (req, res) => {
  UserDb.insert(req.body)
  .then(user => {
    res.status(201).json(user);
  })
  .catch(err => {res.status(500).json({ message: "Error saving new user" });
  });
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  PostDb.insert({
    text: req.body.text,
    user_id: req.params.id
  })
  .then(post => {
    res.status(201).json(post);
  })
  .catch(err => {  res.status(500).json({ message: "Error saving new post", err });
  })
});

router.get('/', (req, res) => {
  UserDb.get()
  .then(users => {
    res.status(200).json(users);
  })
  .catch(err => {
    res.status(500).json({ message: "Error retrieving users." });
  })
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  UserDb.getUserPosts(req.params.id)
  .then(posts => {
    if(posts){
      res.status(200).json(posts);
    } else {
      res.status(404).json({ message: `No posts found for ${req.user.name}.`});
    }
  })
  .catch(err => {
    res.status(500).json({ message: "Error retrieving posts." });
  })
});

router.delete("/:id", validateUserId, (req, res) => {
  UserDb.remove(req.params.id)
    .then(() => {
      res.status(200).json({ message: "success" });
    })
    .catch(() => {
      res.status(500).json({ message: "unable to delete the user" });
    });
});

router.put("/:id", (req, res) => {
  UserDb.update(req.params.id, req.body)
    .then(() => {
      res.status(200).json(req.body);
    })
    .catch(() => {
      res.status(500).json({ message: "unable to update user info" });
    });
});

//MIDDLEWARE

function validateUserId(req, res, next) {
  if (req.params.id){
    UserDb.getById(req.params.id)
  .then(thisUser => {
    if (thisUser) {
      req.user = thisUser;
      next();
    } else {
      res.status(404).json({ message: "invalid user id" });
    }
  })
  .catch(err => {
    res.status(500).json({ message: "Error checking for user." });
  })
  } else {
    res.status(400).json({ message: "User id required."});
  }
  
}

function validateUser(req, res, next) {
  if (req.body) {
    if (req.body.name) {
      next();
    } else {
      res.status(400).json({ message: "missing required name field" })
    }
  } else {
    res.status(400).json({ message: "missing user data" });
  }
}

function validatePost(req, res, next) {
  if (req.body) {
    if (req.body.text) {
      next();
    } else {
      res.status(400).json({ message: "missing required text field" });
    }
  } else {
    res.status(400).json({ message: "missing post data" });
  }
}

module.exports = router;