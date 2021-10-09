import React from 'react';

// @ts-ignore
import * as nodemailer from 'nodemailer';
import ReactDOMServer from 'react-dom/server';

import { Website } from '.prisma/client';

export class EmailService {
  mailer: nodemailer.Transporter;

  user: string;

  from: string;

  constructor() {
    this.user = 'AKIAWLBW2KN6N3ZPRSI3';
    this.from = 'no-reply@codeberater.com';

    this.mailer = nodemailer.createTransport({
      host: 'email-smtp.us-east-1.amazonaws.com',
      port: 587,
      auth: {
        user: this.user,
        pass: 'BGwUBdtzlk/0o9lP2CMyq2ymgry7tES3/tabxc+iTydF',
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

    return {
      subject,
      html,
    };
  }

  async sendWebsiteAlert(webiste: Website, _to: string) {
    const { subject, html } = this.getWebsiteAlertContent(webiste);

    return this.mailer.sendMail({
      from: 'no-reply@codeberater.com',
      to: 'no-reply@codeberater.com',
      subject,
      text: subject,
      html,
    });
  }
}
