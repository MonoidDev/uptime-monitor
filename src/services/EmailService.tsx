import React from 'react';

// @ts-ignore
import * as nodemailer from 'nodemailer';
import ReactDOMServer from 'react-dom/server';

import { Website } from '.prisma/client';

export class EmailService {
  mailer: nodemailer.Transporter;

  user: string;

  constructor() {
    this.user = 'postmaster@sandbox8044a2a4ed9e4ffe9994a18596e368ac.mailgun.org';

    this.mailer = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: 587,
      auth: {
        user: this.user,
        pass: '332e21a05396eac1b9d5c5bdd86df6cf-45f7aa85-0c31b7f8',
      },
    });

    this.mailer.set('proxy_socks_module', require('socks'));
  }

  getWebsiteAlertContent(website: Website) {
    const subject = `[Uptime Monitor] ${website.name} is DOWN!`;

    const url = `https://uptime-monitor-staging.herokuapp.com/monitoring/websiteStatus/${website.id}`;

    const Template = () => (
      <>
        Dear User:
        <br />
        Your website
        {' '}
        <b>{website.name}</b>
        {' '}
        returns with error:
        <b>HTTP Status 500</b>

        <br />

        For more details:
        {' '}
        {url}
      </>
    );

    const html = ReactDOMServer.renderToString(<Template />);

    console.log(html);

    return {
      subject,
      html,
    };
  }

  async sendWebsiteAlert(webiste: Website, to: string) {
    const { subject, html } = this.getWebsiteAlertContent(webiste);

    return this.mailer.sendMail({
      from: this.user,
      to,
      subject,
      text: subject,
      html,
    });
  }
}
