import { prisma } from '../src/lib/prisma';
import { EmailService } from '../src/services/EmailService';

(async () => {
  const service = new EmailService();
  const website = await prisma.website.findFirst();

  const result = await service.sendWebsiteAlert(website!, 'wangchenyu2017@gmail.com');

  console.info(result);
})();
