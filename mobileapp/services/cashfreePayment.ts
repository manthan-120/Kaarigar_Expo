// 

import * as Linking from "expo-linking";

type PaymentParams = {
  checkoutUrl: string;
  redirectUrl: string;
};

export const openCashfreeCheckout = async ({
  checkoutUrl,
  redirectUrl,
}: PaymentParams) => {
  await Linking.openURL(checkoutUrl);

  return {
    type: "opened",
    redirectUrl,
  };
};