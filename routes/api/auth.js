const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");
const brcypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
//@route GET api/auth
//@desc  Test route
//@access Public

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route POST api/auth
//@desc  Authenticate Users and Get token
//@access Public

router.post(
  "/",
  [
    check("email", "Please enter a valid Email").isEmail(),
    check("password", "Password is reqired").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // See if User exists
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ erros: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await brcypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ erros: [{ msg: "Invalid credentials" }] });
      }

      //Return jsonwebtoken so that user can login
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
