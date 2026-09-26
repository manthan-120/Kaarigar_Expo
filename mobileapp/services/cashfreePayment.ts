import * as WebBrowser from "expo-web-browser";

type PaymentParams = {
  checkoutUrl: string;
  redirectUrl: string;
};

export const openCashfreeCheckout = async ({
  checkoutUrl,
  redirectUrl,
}: PaymentParams) => {
  return WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    redirectUrl
  );
};