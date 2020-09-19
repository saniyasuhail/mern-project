const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const request =require("request");
const config=require("config");
//@route GET api/profile/me
//@desc  GET cuurent user profile
//@access Private

router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("User", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route POSt api/profile
//@desc  Create/update user profile
//@access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //Build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    //console.log(profileFields.user);
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;

    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skills) => skills.trim());
    }
    
    //Build social object
    profileFields.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (twitter) profileFields.twitter = twitter;
    if (facebook) profileFields.facebook = facebook;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        
        //Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields }
          //{ //new: true }
        );

        return res.json(profile);
      }

      //Create

      profile1 = new Profile(profileFields);
      await profile1.save();
      
      return res.json(profile1);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route GET api/profile
//@desc  GET all user profile
//@access Private

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("User", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

//@route GET api/profile/user/:userid
//@desc  GET profile by user ID
//@access Private

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("User", ["name", "avatar"]);
    if (!profile) return res.status(400).json({ msg: "Profile not found" });
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId")
      return res.status(400).json({ msg: "Profile not found" });
    res.status(500).send("Server Error");
  }
});

//@route DELETE api/profile
//@desc  DELETE profile by user ID
//@access Private

router.delete("/", async (req, res) => {
  try {
    //Remove profile
    await Profile.findOneAndRemove({
      _id: req.user_id,
    });

    //Remove user
    await User.findOneAndRemove({
      user: req.user_id,
    });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

//@route PUT api/profile/experience
//@desc  Add profile experience
//@access Private

router.put("/experience",
[
auth,
check('title','Title is required')
.not()
.isEmpty(),
check('company','Company is required')
.not()
.isEmpty(),
check('from','From Date is required')
.not()
.isEmpty(),
],
async (req,res)=>{
const errors = validationResult(req);
if(!errors.isEmpty())
{
  return res.status(400).json({error:errors.array()});
}

const{
  title,
  company,
  location,
  from,
  to,
  current,
  description
}=req.body;

const newExp={
  title,
  company,
  location,
  from,
  to,
  current,
  description
}
try{
 const profile =await Profile.findOne({user:req.user.id});
 profile.experience.unshift(newExp);
 await profile.save();

 res.json(profile);
}
  catch(err)
  {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})

//@route DELETE api/profile/experience
//@desc  delete profile experience
//@access Private

router.delete("/experience/:exp_id",auth,async (req,res)=>{
try {
  
  const profile = await Profile.findOne({user:req.user.id});

  const removeIndex=profile.experience.map(item=>item.id).indexOf(req.params.exp_id);
   profile.experience.splice(removeIndex,1);

   await profile.save();

   res.json(profile);
} catch (err) {
  console.error(err.message);
    res.status(500).send('Server Error');
}


})


//@route PUT api/profile/education
//@desc  Add profile education
//@access Private

router.put("/education",
[
auth,
check('school','School is required')
.not()
.isEmpty(),
check('degree','Degree is required')
.not()
.isEmpty(),

check('fieldofstudy','Field Of Study is required')
.not()
.isEmpty(),
check('from','From Date is required')
.not()
.isEmpty(),
],
async (req,res)=>{
const errors = validationResult(req);
if(!errors.isEmpty())
{
  return res.status(400).json({error:errors.array()});
}

const{
  school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
}=req.body;

const newEdu={
  school,
  degree,
  fieldofstudy,
  from,
  to,
  current,
  description
}
try{
 const profile =await Profile.findOne({user:req.user.id});
 profile.education.unshift(newEdu);
 await profile.save();

 res.json(profile);
}
  catch(err)
  {
    console.error(err.message);
    res.status(500).send('Server Error');
  }

})

//@route DELETE api/profile/education
//@desc  delete profile experience
//@access Private

router.delete("/education/:edu_id",auth,async (req,res)=>{
try {
  
  const profile = await Profile.findOne({user:req.user.id});

  const removeIndex=profile.education.map(item=>item.id).indexOf(req.params.exp_id);
   profile.education.splice(removeIndex,1);

   await profile.save();

   res.json(profile);
} catch (err) {
  console.error(err.message);
    res.status(500).send('Server Error');
}
});

//@route GET api/profile/github/:username
//@desc  Get user repos from github
//@access Public

router.get("/github/:username",(req,res)=>
{
  try {
    const options={
      uri:`https://api.github.com/users/${
        req.params.username
      }/repos?per_pages=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
        )}&client_secret=${config.get('githubsecret')}`,
      method:'GET',
      headers:{'user-agent':'node.js'}
    };

    request(options,(error,response,body)=>{
      if(error) 
      console.error(error);

      if(response.statusCode!==200){
        return res.status(404).json({msg:"No github repo find"});
      }
      res.json(body);
    })
  } catch (error) {
    console.error(error.message);
    res.status(404).send("Server Error");
  }

})







module.exports = router;
