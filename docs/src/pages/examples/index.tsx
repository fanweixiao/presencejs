import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import React from 'react';

export default function Index() {
  return (
    <Layout
      title={`group hug`}
      description="Description will go into a meta tag in <head />"
    >
      <div className="px-40 py-20 ">
        <Link to="/examples/group-hug">
          <div className="inline-flex p-20 border rounded-lg">group hug</div>
        </Link>
      </div>
    </Layout>
  );
}
