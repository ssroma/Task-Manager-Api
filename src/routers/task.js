const express = require('express');
const auth = require('../middleware/auth');
const router = new express.Router();

const Task = require('../models/task');

router.post('/tasks', auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send();
  }
})

//GET /tasks/?completed=true
// GET /tasks/limit=10&skip=0
// GET /tasks/sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
  try {
    // const tasks = await Task.find({owner: req.user._id});
    // const countTasks = tasks.length;
    // res.send({tasks: tasks, count: countTasks });
    const match = {};
    const sort = {};
    if(req.query.completed){
      match.completed = completed === "true" ? true : false;
    }
    if(req.query.sortBy){
      const fieldOrder = req.query.sortBy.split(':');
      sort[fieldOrder[0]] = fieldOrder[1] === "desc" ? -1 : 1;
    }

    await req.user.populate({
      path: 'tasks',
      match: match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
      
    });
    const countTasks = req.user.tasks.length;
    res.send({tasks: req.user.tasks, count: countTasks});
  } catch (e) {
    res.status(500).send(e);
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id;
  try {
    //const task = await Task.findById(_id);
    const task = await Task.findOne({_id, owner: req.user._id});
    if(!task){
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send();
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  const fields = Object.keys(body);
  const allowedUpdateFields = ["description", "completed"];
  const isAllowedField = fields.every( (field) => allowedUpdateFields.includes(field));

  if(!isAllowedField){
    return res.send({error: "Some field couldn't be Updated."});
  }

  try {
    const task = await Task.findOne({_id: id, owner: req.user._id});
    //const task = await Task.findById(id);
    if(!task){
      res.status(404).send();
    }
    fields.forEach( field => task[`${field}`] = body[`${field}`] );
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
})

router.delete('/tasks/:id', auth,  async (req, res) => {
  const id = req.params.id;
  try {
    //const task = await Task.findByIdAndDelete({_id: id, owner: req.user._id});
    const task = await Task.findOneAndDelete({_id: id, owner: req.user._id});
    if(!task){
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
})


module.exports = router;
