import express from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import 'dotenv/config'
import User from '../../models/User.js'
import axios from 'axios'
const router = express.Router()
import getRandomCat from 'random-cat-img'
import sendEmail from '../../server/mailer.js'

router.post('/validate', async (req, res) => {
  const [bearer, accessToken] = req.headers.authorization.split(' ')
  if (!accessToken) {
    return res.status(401).json({ message: 'Access token is required' })
  }

  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
      if (bearer !== 'Bearer') {
        console.error('Invalid access token format:', accessToken)
        return res.status(403).json({ message: 'Invalid access token format' })
      }
      if (err) {
        console.error('Invalid access token:', err)
        return res.status(403).json({ message: 'Invalid access token' })
      }
      res.json({ valid: true })
    })
  } catch (error) {
    console.error('Error validating access token:', error)
    res.status(500).json({ message: 'Server error', error })
  }
})

router.post('/token', async (req, res) => {
  if (!req.headers.cookie) {
    console.error('No cookies found in request headers')
    return res.sendStatus(401)
  }
  const refreshToken = req.headers.cookie.split('refreshToken=')[1]
  if (!refreshToken) {
      return res.sendStatus(401)
  }
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err) => {
    if (err) {
      console.error('Error verifying refresh token:', refreshToken, err)
      return res.sendStatus(403)
    }
    const user = await User.findOne({ refreshToken: refreshToken })
      if (!user) {
        console.error('User not found for refresh token:', refreshToken)
        return res.sendStatus(403)

      }

      const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
      user.refreshToken = newRefreshToken
      user.save()
      res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: true,
          origin: 'https://localhost:3000',
      })

      const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.json({ accessToken })
    })
})

router.post('/register', async (req, res) => {
  console.log('Registering user with data:', req.body)
  const saltRounds = 10
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds)
  const user = new User({
    email: req.body.email,
    username: req.body.username,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    password: hashedPassword,
    avatar: await getRandomCat().then(data => data.message),
    bio: req.body.bio,
    location: req.body.location,
    githubUrl: req.body.githubUrl,
    avatarUrl: req.body.avatarUrl
  })
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: 'Username, email, and password are required' })
    } else if (await User.findOne({ username: user.username })) {
      return res.status(400).json({ message: 'Username already exists' })
    } else if (await User.findOne({ email: user.email })) {
      return res.status(400).json({ message: 'Email already exists' })
    }
  } catch (error) {
    return res.status(500).json({ message: 'Error creating user', error })
  }
  await user.save()
  try {
  // --- SEND WELCOME EMAIL ---
  const mailOptions = {
    from: `CodeFolio <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to Our Platform!',
    html: `<h1>Hi ${user.name},</h1><p>Thank you for registering. We're excited to have you!</p>`,
  };
  
  await sendEmail(mailOptions);
  // -------------------------

  res.status(201).json({ message: 'User created successfully. Welcome email sent!', user: user });

  } catch (error) {
      // Check if the error is from sending the email or saving the user
      if (error.message.includes('Failed to send email')) {
          // The user was created, but email failed. Decide how to handle this.
          // For now, we'll still return a success for the user creation but log the email error.
          console.error("User was created, but sending the welcome email failed.", error);
          return res.status(201).json({ message: 'User created successfully, but could not send welcome email.', user: user });
      }
      // Otherwise, it was likely a database save error
      console.error('Error saving user:', error);
      return res.status(500).json({ message: 'Error creating user', error });
  }
})


router.post('/login/jwt', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.password) {
      // User registered via OAuth or missing password
      return res.status(401).json({ message: 'This account does not have a password. Please log in with your OAuth provider.' })
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })

    user.refreshToken = refreshToken
    await user.save()
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      origin: 'https://localhost:3000',
    })
    res.status(200).json({ accessToken, refreshToken })

  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err })
  }
})

// POST /login/google
router.post('/login/google', async (req, res) => {
  const googleAccessToken = req.body.token;

  if (!googleAccessToken) {
    return res.status(400).json({ message: 'No access token provided' });
  }

  try {
    // 1. Get user info from Google
    const { data: googleUser } = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }
    );

    const { id, email, picture, given_name, family_name } = googleUser;
    console.log('Google User Info:', googleUser);
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        username: email.split('@')[0] + crypto.randomBytes(5).toString('hex'),
        email,
        firstName: given_name,
        lastName: family_name,
        password: crypto.randomBytes(128).toString('hex'), // Random password for OAuth
        avatar: picture,
        oAuthProviders: [{ provider: 'google', providerId: id }],
      });
    } else {
      // Add Google provider if not already present
      const exists = user.oAuthProviders.some(
        (p) => p.provider === 'google' && p.providerId === String(id)
      );
      if (!exists) {
        user.oAuthProviders.push({ provider: 'google', providerId: String(id) });
      }
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Save refresh token and user
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      origin: 'https://localhost:3000',
      secure: true,
    });

    // Send access token
    res.json({ accessToken });
  } catch (err) {
    console.error('Google login failed:', err);
    res.status(500).json({
      message: 'Google login failed',
      error: err.message || err,
    });
  }
})

router.get('/login/github', async (req, res) => {
  res.redirect(`https://github.com/login/oauth/authorize?scope=user:email&client_id=${process.env.GITHUB_CLIENT_ID}&scope=user`)
})

router.get('/login/github/callback', async (req, res) => {
  const code = req.query.code
  try {
    // Exchange code for access token
    const resp = await axios.post(
      `https://github.com/login/oauth/access_token`,
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: { accept: 'application/json' },
      }
    )

    const access_token = resp.data.access_token
    console.log('GitHub Access Token:', access_token)

    // 1. Get user profile info
    const { data: userProfile } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    const avatar_url = userProfile.avatar_url

    // 2. Get user email info
    const { data: emails } = await axios.get('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${access_token}` },
    })

    // 3. Extract primary verified email
    const primaryEmailObj = emails.find(email => email.primary && email.verified)
    if (!primaryEmailObj) {
      return res.status(400).json({ message: 'No verified primary email found in GitHub account' })
    }

    const email = primaryEmailObj.email

    // 4. Find or create user
    let user = await User.findOne({ email })
    if (!user) {
      user = new User({
        username: email.split('@')[0] + crypto.randomBytes(5).toString('hex'),
        email,
        password: crypto.randomBytes(128).toString('hex'), // Dummy password
        oAuthProviders: [{
          provider: 'github',
          providerId: userProfile.id,
        }],
        avatar: avatar_url,
      })
    } else {
      const exists = user.oAuthProviders.some(p =>
        p.provider === 'github' && p.providerId === String(userProfile.id)
      )

      if (!exists) {
        user.oAuthProviders.push({ provider: 'github', providerId: String(userProfile.id) })
      }
    }

    // 5. Generate and save tokens
    const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
    console.log('Generated Access Token:', accessToken)
    user.refreshToken = refreshToken
    await user.save()

    // 6. Send cookie and token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      origin: 'https://localhost:3000',
    })
    res.send(`
      <script>
        window.opener.postMessage(
          ${JSON.stringify({ accessToken})},
          "http://localhost:3000"
        );
        window.close();
      </script>
    `)

  } catch (err) {
    console.error('GitHub login failed:', err)
    res.status(500).json({ message: 'GitHub login failed', error: err.message || err })
  }
})
  


router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return res.sendStatus(204)
  }
  try {
    const user = await User.findOne({ refreshToken: refreshToken })
    if (!user) {
      return res.sendStatus(204)
    }
    user.refreshToken = null
    await user.save()
    res.sendStatus(204)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error', error: err })
  }
})



export default router