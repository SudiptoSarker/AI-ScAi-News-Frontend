import type { ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;

type GetLayout = (page: JSX.Element) => JSX.Element;

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: GetLayout
}

type AppPropsWithLayout<P = any> = AppProps<P> & {
  Component: NextPageWithLayout<P>;
};

const defaultGetLayout: GetLayout = (page: JSX.Element): JSX.Element => page;
 
function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  
  const getLayout = Component.getLayout ?? defaultGetLayout
 
  return getLayout(<Component {...pageProps} />);
}

export default appWithTranslation(MyApp);