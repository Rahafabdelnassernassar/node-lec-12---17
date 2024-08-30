const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/users", (req, res) => {
  console.log(req.body);

  const user = new User(req.body);
  user
    .save()
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});
////////////////////////////////////////////////////////////

router.get("/users", (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((e) => res.status(400).send(e));
});

router.get("/users/:id", (req, res) => {
  const id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (!user) return res.status(404).send("Unable to find the user");
      res.status(200).send(user);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

/////////////////////////////////////////////////////////////////

router.patch("/users/:id", async (req, res) => {
  const id = req.params.id;

  const updatedData = Object.keys(req.body);

  try {
    // const foundUser = await User.findByIdAndUpdate(id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    const foundUser = await User.findById(id);

    if (!foundUser) return res.status(404).send("User not found");

    updatedData.forEach((field) => (foundUser[field] = req.body[field]));
    await foundUser.save();

    res.status(200).send(foundUser);
  } catch (error) {
    res.status(400).send(error);
  }
});
///////////////////////////////////////////////////////////////

router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).send("User not found");
    res.status(200).send(deletedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

/////////////////////////////////////////////////////////
//login

router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );

    const token = await user.generateToken();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

//////////////////////////////////////////////////////////\//
// token

router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    const token = await user.generateToken();
    await user.save();
    res.status(200).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});
/////////////////////////////////////////////
//profile
router.get("/profile", async (req, res) => {
  res.status(200).send(req.user);
});

/////////////////////////////////////////
//logout
router.delete("/logout", async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

/////////////////////////////////////////////////

module.exports = router;
