import React from 'react';

import { Website } from '@prisma/client';
import humanizeDuration from 'humanize-duration';
// @ts-ignore
import * as nodemailer from 'nodemailer';
import ReactDOMServer from 'react-dom/server';

export class EmailService {
  mailer: nodemailer.Transporter;

  user: string;

  from: string;

  constructor() {
    this.user = process.env.EMAIL_USER;
    this.from = process.env.EMAIL_FROM;

    this.mailer = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: this.user,
        pass: process.env.EMAIL_PASSWORD,
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
        <a href={website.url}>
          <b>{website.name}</b>
        </a>
        {' '}
        has just responded with error.

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

  async sendWebsiteAlert(website: Website, to: string) {
    const { subject, html } = this.getWebsiteAlertContent(website);

    console.info(`Sending alert to ${to} about ${website.url}...`);

    return this.mailer.sendMail({
      from: this.from,
      to,
      subject,
      text: subject,
      html,
    });
  }

  getWebsiteHttpsExpireContent(website: Website) {
    const duration = humanizeDuration(
      website.httpsCertExpiredAt!.getTime() - Date.now(),
      {
        units: ['y', 'mo', 'w', 'd', 'h'],
        round: true,
      },
    );
    const subject = `[Uptime Monitor] ${website.name} expires in ${duration}!`;

    const url = `https://uptime-monitor-staging.herokuapp.com/monitoring/websiteStatus/${website.id}`;

    const Template = () => (
      <>
        Dear User:
        <br />
        The SSL certificate website for
        {' '}
        <a href={website.url}>
          <b>{website.name}</b>
        </a>
        {' '}
        is expiring in
        {' '}
        {duration}
        {' '}
        at
        {' '}
        {website.httpsCertExpiredAt?.toUTCString()}
        .
        {' '}
        Please update your certificate in advance.

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

  async sendWebsiteHttpsExpireAlert(website: Website, to: string) {
    const { subject, html } = this.getWebsiteHttpsExpireContent(website);

    console.info(`Sending alert to ${to} about ${website.url}...`);

    return this.mailer.sendMail({
      from: this.from,
      to,
      subject,
      text: subject,
      html,
    });
  }
}
