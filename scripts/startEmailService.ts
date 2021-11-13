import { prisma } from '../src/lib/prisma';
import { EmailService } from '../src/services/EmailService';

(async () => {
  const service = new EmailService();
  const website = await prisma.website.findFirst();

  let result: any;
  result = await service.sendWebsiteAlert(website!, 'wangchenyu2017@gmail.com');
  console.info(result);

  result = await service.sendWebsiteHttpsExpireAlert(website!, new Date(), 'wangchenyu2017@gmail.com');
  console.info(result);
})();
