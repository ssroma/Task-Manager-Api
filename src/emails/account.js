const sgMail = require('@sendgrid/mail');
const chalk = require('chalk');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {

  sgMail.send({
    to: email,
    from: "santosderoma@hotmail.com",
    subject: "Welcome to the Task Manager App.",
    text: `Welcome ${name}, Let me know how you get along with the app.`,
    html: `<h4> Welcome ${name},  </h4><p>Please find more info in "sergioroma.com"</p.>`
  });
  console.log(chalk.bold.green(`Welcome Email Sent to ${name}`));
}

const sendCancelationEmail = (email, name) => {

  sgMail.send({
    to: email,
    from: "santosderoma@hotmail.com",
    subject: "We are sorry, that you have left.",
    text: `Hi ${name}, Please let us know what we can do to improve the service`,
    html: `<h4> Hi ${name},</h4>
      <p>Please let us know what we can do to improve the service at sergioroma.com</p.>
      <p> Plase take some time to participate in you survey, Thanks. </p>`
  });
  console.log(chalk.bold.red(`Welcome Email Sent to ${name}`));
}


module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
}