// /* eslint-disable */
// import { createConnector } from "wagmi";
// import { injected } from "wagmi/connectors";

// function getExplicitInjectedProvider(flag) {
//   if (typeof window === "undefined" || typeof window.ethereum === "undefined")
//     return;
//   const providers = window.ethereum.providers;
//   return providers
//     ? providers.find((provider) => provider[flag])
//     : window.ethereum[flag]
//     ? window.ethereum
//     : void 0;
// }
// function getWindowProviderNamespace(namespace) {
//   const providerSearch = (provider, namespace2) => {
//     const [property, ...path] = namespace2.split(".");
//     const _provider = provider[property];
//     if (_provider) {
//       if (path.length === 0) return _provider;
//       return providerSearch(_provider, path.join("."));
//     }
//   };
//   if (typeof window !== "undefined") return providerSearch(window, namespace);
// }

// function getInjectedProvider({ flag, namespace }) {
//   var _a;
//   if (typeof window === "undefined") return;
//   if (namespace) {
//     const windowProvider = getWindowProviderNamespace(namespace);
//     if (windowProvider) return windowProvider;
//   }
//   const providers = (_a = window.ethereum) == null ? void 0 : _a.providers;
//   if (flag) {
//     const provider = getExplicitInjectedProvider(flag);
//     if (provider) return provider;
//   }
//   if (typeof providers !== "undefined" && providers.length > 0)
//     return providers[0];
//   return window.ethereum;
// }
// function createInjectedConnector(provider) {
//   return (walletDetails) => {
//     const injectedConfig = provider
//       ? {
//           target: () => ({
//             id: walletDetails.rkDetails.id,
//             name: walletDetails.rkDetails.name,
//             provider,
//           }),
//         }
//       : {};
//     return createConnector((config) => ({
//       ...injected(injectedConfig)(config),
//       ...walletDetails,
//     }));
//   };
// }
// function getInjectedConnector({ flag, namespace, target }) {
//   const provider = target ? target : getInjectedProvider({ flag, namespace });
//   return createInjectedConnector(provider);
// }

// export const holdstationWallet = ({ projectId }) => ({
//   id: "holdstation",
//   name: "Holdstation",
//   iconUrl: "/images/partners/holdstation.png",
//   iconBackground: "#0c2f78",
//   downloadUrls: {
//     android:
//       "https://play.google.com/store/apps/details?id=io.holdstation&pli=1",
//     ios: "https://apps.apple.com/us/app/holdstation-web3-wallet/id6444925618",
//     qrCode:
//       "https://holdstation.com/_next/image?url=%2Flogo%2Flogo-scan.png&w=3840&q=75",
//   },
//   mobile: {
//     getUri: void 0,
//   },
//   qrCode: {
//     getUri: (uri) => uri,
//     instructions: {
//       learnMoreUrl: "https://holdstation.com/",
//       steps: [],
//     },
//   },
//   createConnector: getInjectedConnector({ namespace: "ethereum" }),
// });
