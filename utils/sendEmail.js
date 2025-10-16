import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

 export const sendEmail = async (options)=>{
    const message = {
      to: options.email,
      from: process.env.SENDGRID_MAIL,
      templateId: options.templateId,
      dynamic_template_data: options.data,
    };
await sgMail.send(message)
.then(()=>{
    console.log('Email sent')
    }).catch((error)=>{
        console.log(error)
    });
}

