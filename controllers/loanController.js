const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserOTP = require('../Models/OTP');
const { JWTPASS } = require('../utilities/config');
const Loanuser = require('../Models/loanUserModel');


const loanController = {
    signup: async (req, res) => {
        const { name, email, password,phone } = req.body;
        try {
            const user = await Loanuser.findOne({ email })
            if (user) {
                return res.json({message:"Already This email used"})
            }
            else {
                const passwordHash = await bcrypt.hash(password, 10)
                const user = new Loanuser({
                    name,email,passwordHash,phone
                })
                await user.save()
                return res.json({message:"user created"})
            }
      
        } catch (error) {
            console.log('signup error',error)
            return res.json({message:"signup error"})
        }
    },
    signInOTP: async (req, res) => {
        const { email } = req.body;
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const expiryTime = new Date(Date.now() + 5 * 60 * 1000);
        try {
            let user = await UserOTP.findOne({ email });
            if (user) {
                user.OTP = OTP;
                user.expiryTime = expiryTime;
                await user.save();
            } else {
                user = await UserOTP.create({ email, OTP, expiryTime });
            }
            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ertitech.solutions@gmail.com',
                    pass: 'mnpwebrrdxksnzwu'
                },
            });
        
            const mailOptions = {
                from: 'noreply@example.com',
                to: email,
                subject: 'SignIn OTP for LOANZSIMPL App',
                text: `You are receiving this email because you requested to log in to your Loanzsimpl account using OTP: ${OTP}. 
                This OTP is only valid for 5 minutes.`
            };
        
            transporter.sendMail(mailOptions, async (error, info) => {
                if (error) {
                    console.log(error);
                    return res.json({ message: 'Error sending OTP email' });
                } else {
                    return res.json({ message: 'OTP sent to email successfully' });
                }
            });
        } catch (error) {
            console.log('signInOTP error', error);
            return res.json({ message: "SignIn OTP error" });
        }
    },
    verifyOTP: async (req, res) => {
        const { email, OTP } = req.body;
        try {
            const user = await UserOTP.findOne({ email });
            if (!user) {
                return res.json({ message: "User not found" });
            }
            if (user.expiryTime < new Date()) {
                await UserOTP.deleteOne({ email });                
                return res.json({ message: "OTP document deleted due to expiration" });
            }
            if (user&&user.OTP === OTP&&user.expiryTime > new Date()) {
                await UserOTP.deleteOne({ email });                
                return res.json({ message: "OTP is verified" });
            } else {
                // console.log(user.OTP);
                return res.json({ message: "Invalid OTP or OTP expired" });
            }
        } catch (error) {
            console.log('verifyOTP error', error);
            return res.json({ message: "OTP verification error" });
        }
    },        

    signIn: async (req, res) => {
        try {
            const { email, password } = req.body
            const user = await Loanuser.findOne({ email })
            if (user) {
                const passwordMatch = await bcrypt.compare(password, user.passwordHash)
                if (!passwordMatch) {
                    return res.json({ message: "Invalid Password" })
                }
                const Token = jwt.sign({
                    email: email,
                    id: user._id
                }, JWTPASS)
                return res.json({ Token, message: "User Login success" })
            }
            return res.json({ message: "Invalid User" })
        } catch (error) {
            console.log('signIn error', error)
            return res.json({ message: "Sign In error" })
        }
    },
    user: async (req, res) => {
        try {
            const email = req.params.email;
            const user = await Loanuser.findOne({email})
            if (user) {
                return res.json(user)
            }
            return res.json({ message: 'User not found' })
        } catch (error) {
            console.log(error)
            return res.json({ message: 'Error: User not found' })
        }
    },
    editProfile:async (req, res) => {
        try {
          const emailId = req.params.email;
          const { name, email, pic, address, phone, password, language } = req.body;
      
          const updateFields = {};
          if (name) updateFields.name = name;
          if (email) updateFields.email = email;
          if (pic) updateFields.pic = pic;
          if (address) updateFields.address = address;
          if (phone) updateFields.phone = phone;
          if (password) updateFields.password = password;
          if (language) updateFields.language = language;
      
          const user = await Loanuser.findOneAndUpdate(
            { email: emailId }, 
            updateFields, 
            { new: true } 
          );
      
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          return res.json({ message: 'Profile updated successfully', user });
        } catch (error) {
          console.error('Edit Profile error:', error);
          return res.status(500).json({ message: 'Edit Profile error' });
        }
      },resetPassword: async(req, res) =>{
        const { email } = req.body;
        const user = await Loanuser.findOne({ email })
        if (!user) {
            return res.json({meaasge:"Invaild User"})
        }
        const OTP = Math.random().toString(36).slice(-6);
        user.reset_OTP = OTP
        await user.save()
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ertitech.solutions@gmail.com',
              pass: 'mnpwebrrdxksnzwu',
            },
          });
          const mailOptions = {
            from: 'Password_resest_noreply@gmail.com',
            to: email,
            subject: 'Reset Your Password',
            text: `you are receiving this email because you request has passwords reset for your account .\n\n please use the following OTP  reset your password:${OTP} \n\n if you did not request a password to ignore this email. `,
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.json({ message: 'Error sending reset email' });
            } else {
              return res.json({ message: 'Reset email sent successfully' });
            }
          });
    },
      mailSend: async(req, res) =>{
        const { name,email,phone,subject,message } = req.body;

  
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'ertitech.solutions@gmail.com',
              pass: 'mnpwebrrdxksnzwu',
            },
          });
          const mailOptions = {
            from: 'Contact_noreply@gmail.com',
            to: 'ertitech.solutions@gmail.com',
            subject,
            html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>LoanzSimpl Contact Details</title>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 20px;
                        }
                        .container {
                        max-width: 600px;
                        margin: auto;
                        background-color: #fff;
                        padding: 20px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                        background-color: #f69135;
                        color: #fff;
                        padding: 10px;
                        text-align: center;
                        border-top-left-radius: 8px;
                        border-top-right-radius: 8px;
                        margin-top: -20px;
                        margin-bottom: 20px;
                        }
                        .section {
                        margin-bottom: 20px;
                        }
                        .section h2 {
                        color: #333;
                        font-size: 20px;
                        margin-bottom: 10px;
                        border-bottom: 2px solid #f69135;
                        padding-bottom: 5px;
                        }
                        .message {
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 5px;
                        border: 1px solid #ccc;
                        }
                        .footer {
                        text-align: center;
                        margin-top: 20px;
                        color: #888;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="header">
                        <h1>Loanzsimpl Contact Details</h1>
                        </div>
                        <div class="section">
                        <h2>Contact Information</h2>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        </div>
                        <div class="section">
                        <h2>Message</h2>
                        <div class="message">
                            <p>${message}</p>
                        </div>
                        </div>
                    </div>
                    </body>
                    </html>
                    `,
          };
        
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.json({ message: 'Error sending contact email' });
            } else {
              return res.json({ message: 'Contact email sent successfully' });
            }
          });
    },
    
    newpassword: async (req, res) => {
        try {
            const { password,OTP} = req.body;
            if (!password) {
                return res.json({ message: "Please enter the new password" });
            }
            const user = await Loanuser.findOne({ reset_OTP: OTP })
            if (!user) {
                return res.json({ message: "Invalid OTP" });
            }
            const NewPass = await bcrypt.hash(password, 10);
            user.passwordHash = NewPass;
            user.reset_OTP = null;

            await user.save();

            res.json({ message: "Password reset successfully" })
        }
        catch (error) {
            console.log(error);
            return res.json({ message: "Error: Password reset failed" })
        }
    },
    loanDetails: async (req, res) => {
        try {
            const { email, loanType, details } = req.body;
            const user = await Loanuser.findOne({ email });
    
            if (!user) {
                return res.json({ message: "Invalid User" });
            }
    
            switch (loanType) {
                case 'personalLoan':
                    user.loans.personalLoan.push(...details);
                    break;
                case 'creditCardLoan':
                    user.loans.creditCardLoan.push(...details);
                    break;
                case 'businessLoan':
                    user.loans.businessLoan.push(...details);
                    break;
                default:
                    return res.json({ message: "Invalid loanType" });
            }
    
            await user.save();
            return res.json({ message: "Loan details updated successfully" });
        } catch (error) {
            console.log(error);
            return res.json({ message: "Error: Loan Details update failed" });
        }
    } ,
    loanEmail:async(req, res)=> {
        try {
            const { email, loanType } = req.body;
            const user = await Loanuser.findOne({ email });
    
            if (!user) {
                return res.json({ message: "Invalid User" });
            }
    
            let loanDetails;
            switch (loanType) {
                case 'personalLoan':
                    loanDetails = user.loans.personalLoan;
                    break;
                case 'creditCardLoan':
                    loanDetails = user.loans.creditCardLoan;
                    break;
                case 'businessLoan':
                    loanDetails = user.loans.businessLoan;
                    break;
                default:
                    return res.json({ message: "Invalid loanType" });
            }
    
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'ertitech.solutions@gmail.com',
                    pass: 'mnpwebrrdxksnzwu',
                },
            });
            let formattedLoanType = loanType.charAt(0).toUpperCase()+loanType.slice(1) ;
             formattedLoanType = formattedLoanType.slice(0, -4); 
            const htmlContent = `
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                    }
                    .header {
                        background-color: #007bff;
                        color: #fff;
                        padding: 10px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .details {
                        padding: 20px;
                    }
                    .details table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .details th, .details td {
                        padding: 10px;
                        border: 1px solid #ddd;
                    }
                    .details th {
                        background-color: #f2f2f2;
                        text-align: left;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>${formattedLoanType} Loan Details</h2>
                    </div>
                    <div class="details">
                        <table>
                            <thead>
                                <tr>
                                    <th>Field</th>
                                    <th>Value</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${loanDetails.map(detail => {
                                    return Object.entries(detail).map(([key, value]) => `
                                        <tr>
                                            <td>${key}</td>
                                            <td>${value}</td>
                                        </tr>
                                    `).join('');
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </body>
            </html>
        `;
    
            const mailOptions = {
                from: 'loan_noreply@gmail.com',
                to: 'ertitech.solutions@gmail.com', 
                subject: `${formattedLoanType} Loan Details`, 
                html: htmlContent,
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    return res.json({ message: 'Error in sending loan Mail' });
                } else {
                    return res.json({ message: 'Loan Details email sent successfully' });
                }
            });
        } catch (error) {
            console.log(error);
            return res.json({ message: "Error: Loan Details Mail sending failed" });
        }
    },
    loanUsers:async(req, res) =>{
        try {
            const {email}=req.params;
             const users = await Loanuser.findOne({email})
             return res.json(users)
        } catch (error) {
            console.log(error);
            return res.json({ message: "Error: User Fetching failed" })  
        }
    },
}

module.exports = loanController;
