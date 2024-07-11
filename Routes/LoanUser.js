const express = require('express')
const loanController = require('../controllers/loanController')
const LoanuserRoute = express.Router()

LoanuserRoute.post('/', loanController.signup)
LoanuserRoute.post('/signin', loanController.signIn)
LoanuserRoute.post('/otp', loanController.signInOTP)
LoanuserRoute.post('/verify', loanController.verifyOTP)
LoanuserRoute.get('/:email', loanController.user)
LoanuserRoute.put('/edit/:email',loanController.editProfile)
LoanuserRoute.post('/resetPassword', loanController.resetPassword);
LoanuserRoute.post('/newPassword',loanController.newpassword);
LoanuserRoute.post('/user/email',loanController.loanEmail);
LoanuserRoute.post('/user/details',loanController.loanDetails);
LoanuserRoute.get('/user/:email',loanController.loanUsers);
LoanuserRoute.post('/send',loanController.mailSend);

module.exports=LoanuserRoute;