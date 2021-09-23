import { Layout } from '../../components/Layout';

export default function Page() {
  return (
    <Layout
      breadcrumb={[
        {
          title: 'Monitoring',
          href: '/monitoring/websites',
        },
        {
          title: 'Websites',
          href: '/monitoring/websites',
        },
      ]}
    />
  );
}
