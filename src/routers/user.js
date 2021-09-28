const express = require('express');
const User = require('../models/user');
const auth = require('../middleware/auth');
const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account');
// Library to handle form-data
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router();

router.post('/users', async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user: user, token: token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/login', async (req, res) => {
  const {email, password} = req.body;
  try{
    const user = await User.findByCredentials(email, password);
    if(!user){
      return res.send('some went wrong');
    }
    const token = await user.generateAuthToken();
    res.send({ user: user, token: token });
  }catch(e){
    res.status(400).send(e);
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try{
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send(`You are logged out.`)
  }catch(e){
    res.status(500).send(`Some went wrong.`);
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try{
    // req.user.tokens = req.user.tokens.filter((token) => {
    //   return token.token === req.token;
    // });
    req.user.tokens = [];
    await req.user.save();
    res.send({logoutAllMsg: `All device are logged out.`})
  }catch(e){
    res.status(500).send({logoutMsg: 'Some went wrong! trying to logout all device.'});
  }
})

router.get('/users/me', auth, async (req, res) => {
  // req.user comes from auth in the meddleware authentication
  res.send({user: req.user});
})

// Not needed as we have /users/me to get the users profile
// router.get('/users/:id', async (req, res) => {
//   const _id = req.params.id; 
//   try {
//     const user = await User.findById(_id);
//     if(!user){
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
// })

router.patch('/users/me', auth, async (req, res) => {
  const id = req.user._id;
  const body = req.body;
  const updates = Object.keys(body);
  const allowedField = ["name", "email", "password"];
  const isValidField = updates.every((update) => allowedField.includes(update));

  if(!isValidField){
    return res.status(400).send({error: "Some field can't be Updated."})
  }

  try {
    updates.forEach( update => req.user[`${update}`] = body[`${update}`] );
    await req.user.save();
    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
})

router.delete('/users/me', auth, async (req, res) => {
  const id = req.user._id;
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);
    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
})

// Set up Multer, passing the file to store the data.
const upload = multer({
  //dest: './avatar',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
      return cb(new Error('File must be a JPG, JPEG or PNG'));
    }
    cb(undefined, true);
  }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).png().resize({width: 250, height: 250}).toBuffer();
  req.user.avatar = buffer; 
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({error: error.message});
});

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined; 
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {

  try{
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar){
      throw new Error();
    }
    res.set('Content-type', 'image/png');
    res.send(user.avatar); 
  }catch(e){
    res.status(404).send();
  }
})


module.exports = router