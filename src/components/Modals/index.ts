export * from "./ExportModal";
export * from "./ImportTemplateModal";

export const templates = [
  {
    id: "template1",
    title: "Earth Day",
    author: "Harpreet Singh",
    json: {
      root: {
        type: "EmailLayout",
        data: {
          style: {
            canvasColor: "#814A9E",
            textColor: "#f0f0f0",
            fontFamily: "Modern Sans",
            padding: {
              top: 5,
              right: 5,
              bottom: 5,
              left: 5,
            },
          },
          childrenIds: [
            "m8460iwm-ow9cv-eyj0vc",
            "m84c07vs-4igwv--vpalyw",
            "m84g2aq2-lp65c-9zcyho",
            "m84gbpdc-tyd0o-h8ntmv",
            "m84gzp0f-gd23b--za274x",
          ],
        },
      },
      "m8460iwm-ow9cv-eyj0vc": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "",
            customCss:
              "background-image : url(https://d1oco4z2z1fhwp.cloudfront.net/templates/default/8646/MainInvite.png)\n\nheight : 10",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 1,
            cellWidths: [100],
          },
          childrenIds: ["m8460lng-sbqsi-f0n9xj"],
        },
      },
      "m8460lng-sbqsi-f0n9xj": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 24,
              right: 24,
              bottom: 24,
              left: 24,
            },
            backgroundColor: "",
            verticalAlign: "top",
          },
          childrenIds: [
            "m84614xw-n7fk2-ffj4fv",
            "m846p62i-bozos-xz2g7w",
            "m846q6u3-uxote-yrfqf8",
            "m846vluk-jj96d--w37atk",
            "m846vwo8-9oalx--vuumqw",
            "m84705t1-no7ub--skowpw",
            "m8485j7z-2rxmm-3cjpsb",
            "m84bdcsv-nar09-loq2tz",
          ],
        },
      },
      "m84614xw-n7fk2-ffj4fv": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            textAlign: "center",
            width: 48,
            height: 48,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://d1oco4z2z1fhwp.cloudfront.net/templates/default/8646/logos_feathers1x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m846p62i-bozos-xz2g7w": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "#FFFF",
            fontFamily: "Arial",
            fontSize: 20,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 15,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "EVENT",
            navigateToUrl: "",
          },
        },
      },
      "m846q6u3-uxote-yrfqf8": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "#FFFF",
            fontFamily: "Helvetica",
            fontSize: 40,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "RAMADAN DAY",
            navigateToUrl: "",
          },
        },
      },
      "m846vluk-jj96d--w37atk": {
        type: "Spacer",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
          },
        },
      },
      "m846vwo8-9oalx--vuumqw": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "#FEC90B",
            fontFamily: "Times New Roman",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "10 March 2024",
            navigateToUrl: "",
          },
        },
      },
      "m84705t1-no7ub--skowpw": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "#FFFF",
            fontFamily: "Arial",
            fontSize: 24,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "You are invited!\n\n\nWith Family\n",
            navigateToUrl: "",
          },
        },
      },
      "m8485j7z-2rxmm-3cjpsb": {
        type: "Button",
        data: {
          style: {
            textAlign: "center",
            fontWeight: "700",
            fontFamily: "Arial",
            fontSize: 14,
            color: "#FFFF",
            buttonColor: "#A3A5A8",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            buttonPadding: {
              top: 4,
              right: 18,
              bottom: 4,
              left: 18,
            },
            width: 114,
            height: 35,
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: 4,
          },
          props: {
            text: "Learn more",
            navigateToUrl: "",
            textAlign: "center",
          },
        },
      },
      "m84bdcsv-nar09-loq2tz": {
        type: "Spacer",
        data: {
          style: {
            padding: {
              top: 23,
              right: 23,
              bottom: 23,
              left: 23,
            },
            backgroundColor: "",
          },
        },
      },
      "m84c07vs-4igwv--vpalyw": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 1,
            cellWidths: [100],
          },
          childrenIds: ["m84c0cl2-2br3p--vlo01g"],
        },
      },
      "m84c0cl2-2br3p--vlo01g": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 7,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "#F3E9CE",
          },
          childrenIds: [
            "m84c0ug3-t69vw--v7vugt",
            "m84c4nwe-olo43--s9tpot",
            "m84cly88-jrgip--exmsag",
            "m84cmxkj-2nv7f--e6d2jo",
            "m84coavw-u3r7t--d4b7f9",
          ],
        },
      },
      "m84c0ug3-t69vw--v7vugt": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "",
            fontFamily: "Arial",
            fontSize: 20,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "We would appreciate if you'd be there!",
            navigateToUrl: "",
          },
        },
      },
      "m84c4nwe-olo43--s9tpot": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "",
            fontFamily: "Arial",
            fontSize: 14,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Time - 12:00 PM",
            navigateToUrl: "",
          },
        },
      },
      "m84cly88-jrgip--exmsag": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "",
            fontFamily: "Arial",
            fontSize: 14,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Location : Ramiz Sadiku, Prishtine 10000, Kosvo",
            navigateToUrl: "",
          },
        },
      },
      "m84cmxkj-2nv7f--e6d2jo": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "",
            fontFamily: "Arial",
            fontSize: 14,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi.",
            navigateToUrl: "",
          },
        },
      },
      "m84coavw-u3r7t--d4b7f9": {
        type: "Button",
        data: {
          style: {
            textAlign: "center",
            fontWeight: "400",
            fontFamily: "Arial",
            fontSize: 16,
            color: "#FFFF",
            buttonColor: "#000000",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            buttonPadding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            width: 128,
            height: 37,
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: 4,
          },
          props: {
            text: "I'll be there",
            navigateToUrl: "",
            textAlign: "center",
          },
        },
      },
      "m84g2aq2-lp65c-9zcyho": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "#F3E9CE",
            customCss: "width: 600px;",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 1,
            cellWidths: [100],
          },
          childrenIds: ["m84g2aq2-73lv5-9zcykg"],
        },
      },
      "m84g2aq2-73lv5-9zcykg": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "bottom",
          },
          childrenIds: [
            "m84g36r9-9h3wm-ao2s20",
            "m84g6dri-xfclw-d4tejb",
            "m84g84w4-4qgq0-ehiz8n",
          ],
        },
      },
      "m84g36r9-9h3wm-ao2s20": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "left",
            width: 577,
            height: 54,
            objectFit: "contain",
            customCss: "height: 45px;\nborder: none;\nwidth: 577px\n",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://d1oco4z2z1fhwp.cloudfront.net/templates/default/8646/WaveTop.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84g6dri-xfclw-d4tejb": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "#25",
            customCss: "border: none;",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 1,
            cellWidths: [100],
          },
          childrenIds: ["m84g6dri-qffx7-d4tem4"],
        },
      },
      "m84g6dri-qffx7-d4tem4": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: [
            "m84g7cjy-w0e1h-dvntfj",
            "m84gnmn1-0j0sl-qfvydw",
            "m84gnxds-kp4om-qo6dio",
            "m84guwrt-wrxw4-w25fkc",
          ],
        },
      },
      "m84g7cjy-w0e1h-dvntfj": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "",
            fontFamily: "Arial",
            fontSize: 20,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 0,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "SPREAD THE WORD",
            navigateToUrl: "",
          },
        },
      },
      "m84gnmn1-0j0sl-qfvydw": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "",
            fontFamily: "Arial",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 0,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Know someone who should attend?",
            navigateToUrl: "",
          },
        },
      },
      "m84gnxds-kp4om-qo6dio": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "",
            fontFamily: "Arial",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 5,
              right: 10,
              bottom: 5,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Share on social media to let them know:",
            navigateToUrl: "",
          },
        },
      },
      "m84guwrt-wrxw4-w25fkc": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 3,
            cellWidths: [33, 33, 33],
          },
          childrenIds: [
            "m84guwrt-h1v0l-w25fn3",
            "m84guwrt-i7nks-w25fn3",
            "m84gv4bc-booig-w7yxm8",
          ],
        },
      },
      "m84guwrt-h1v0l-w25fn3": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84gwve8-3rkib-xkn5pj"],
        },
      },
      "m84gwve8-3rkib-xkn5pj": {
        type: "Spacer",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
          },
        },
      },
      "m84guwrt-i7nks-w25fn3": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84gortq-jhhl7-rbo0vr"],
        },
      },
      "m84gortq-jhhl7-rbo0vr": {
        type: "Columns",
        data: {
          style: {
            columnGap: 10,
            backgroundColor: "#FEC90B",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 4,
            cellWidths: [25, 25, 25, 25],
          },
          childrenIds: [
            "m84gortq-1bey4-rbo0yk",
            "m84gortq-yuufq-rbo0yk",
            "m84goum0-a4gna-rdtedj",
            "m84gousc-f5uwo-rdy9wz",
          ],
        },
      },
      "m84gortq-1bey4-rbo0yk": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84gp6pb-pih6h-rn59t7"],
        },
      },
      "m84gp6pb-pih6h-rn59t7": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "right",
            width: 25,
            height: 25,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/facebook@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84gortq-yuufq-rbo0yk": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84gph5q-9pnpf-rv7ptv"],
        },
      },
      "m84gph5q-9pnpf-rv7ptv": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "center",
            width: 25,
            height: 25,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/twitter@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84goum0-a4gna-rdtedj": {
        type: "Column",
        data: {
          style: {},
          childrenIds: ["m84gpvtz-vh772-s6jbd4"],
        },
      },
      "m84gpvtz-vh772-s6jbd4": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "left",
            width: 25,
            height: 25,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/linkedin@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84gousc-f5uwo-rdy9wz": {
        type: "Column",
        data: {
          style: {},
          childrenIds: ["m84gpzat-xpjt6-s97ncc"],
        },
      },
      "m84gpzat-xpjt6-s97ncc": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "left",
            width: 25,
            height: 25,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-dark-gray/instagram@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84gv4bc-booig-w7yxm8": {
        type: "Column",
        data: {
          style: {},
          childrenIds: ["m84gwwwf-6x1jx-xlszt0"],
        },
      },
      "m84gwwwf-6x1jx-xlszt0": {
        type: "Spacer",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
          },
        },
      },
      "m84g84w4-4qgq0-ehiz8n": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            textAlign: "left",
            width: 680,
            height: 45,
            objectFit: "contain",
            customCss: "border: none",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://d1oco4z2z1fhwp.cloudfront.net/templates/default/8646/WaveBottom.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84gbpdc-tyd0o-h8ntmv": {
        type: "Spacer",
        data: {
          style: {
            padding: {
              top: 16,
              right: 16,
              bottom: 16,
              left: 16,
            },
            backgroundColor: "#F3E9CE",
          },
        },
      },
      "m84gzp0f-gd23b--za274x": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "#000000",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 2,
            cellWidths: [45, 55],
          },
          childrenIds: ["m84gzp0f-h19fv--za274x", "m84gzp0f-y78w5--za2724"],
        },
      },
      "m84gzp0f-h19fv--za274x": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 31,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: [
            "m84h0xx8-3z63z--ybeny4",
            "m84h3pu2-jwixj--w6bc7x",
            "m84h57ar-9iqs4--v12894",
          ],
        },
      },
      "m84h0xx8-3z63z--ybeny4": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "#FFFFFF",
            fontFamily: "Arial",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 20,
            },
            backgroundColor: "",
            textAlign: "left",
          },
          props: {
            text: "Social media",
            navigateToUrl: "",
          },
        },
      },
      "m84h3pu2-jwixj--w6bc7x": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "#EFEFEF",
            fontFamily: "Arial",
            fontSize: 14,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 18,
            },
            backgroundColor: "",
            textAlign: "left",
          },
          props: {
            text: "Stay up-to-date with current activities and future events by following us on your favorite social media channels.",
            navigateToUrl: "",
          },
        },
      },
      "m84h57ar-9iqs4--v12894": {
        type: "Columns",
        data: {
          style: {
            columnGap: 0,
            backgroundColor: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            rows: 1,
            columns: 3,
            cellWidths: [33, 33, 33],
          },
          childrenIds: [
            "m84h57ar-lzvek--v12894",
            "m84h57ar-i1x7o--v1286c",
            "m84h5fqf-qyp7t--uujwu4",
          ],
        },
      },
      "m84h57ar-lzvek--v12894": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84h5rea-ewo2e--uljy9c"],
        },
      },
      "m84h5rea-ewo2e--uljy9c": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            textAlign: "right",
            width: 64,
            height: 40,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: 0,
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/facebook@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84h57ar-i1x7o--v1286c": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: ["m84h5st8-4m4g2--ukgn4w"],
        },
      },
      "m84h5st8-4m4g2--ukgn4w": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            textAlign: "left",
            width: 64,
            height: 40,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/instagram@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84h5fqf-qyp7t--uujwu4": {
        type: "Column",
        data: {
          style: {},
          childrenIds: ["m84h5u4x-5d4c6--ujfur5"],
        },
      },
      "m84h5u4x-5d4c6--ujfur5": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            textAlign: "left",
            width: 64,
            height: 40,
            objectFit: "contain",
            borderWidth: "",
            borderStyle: "",
            borderColor: "",
            borderRadius: "",
          },
          props: {
            imageUrl:
              "https://app-rsrc.getbee.io/public/resources/social-networks-icon-sets/t-only-logo-default-gray/twitter@2x.png",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m84gzp0f-y78w5--za2724": {
        type: "Column",
        data: {
          style: {
            padding: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
            },
            backgroundColor: "",
            verticalAlign: "middle",
          },
          childrenIds: [
            "m84h0zfp-6iace--ya8n51",
            "m84izxi0-ihz29-kghld8",
            "m84iykhg-19k53-jeo1gz",
          ],
        },
      },
      "m84h0zfp-6iace--ya8n51": {
        type: "Text",
        data: {
          style: {
            fontWeight: "700",
            color: "#FFFFFF",
            fontFamily: "Arial",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 1,
              bottom: 41,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "center",
          },
          props: {
            text: "Where to find us\n\n\n",
            navigateToUrl: "",
          },
        },
      },
      "m84izxi0-ihz29-kghld8": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "#FFFF",
            fontFamily: "",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 8,
              right: 10,
              bottom: 7,
              left: 87,
            },
            backgroundColor: "",
            textAlign: "left",
          },
          props: {
            text: "ALL TOGETHER\nPrishtine, 1000\nKosovo",
            navigateToUrl: "",
          },
        },
      },
      "m84iykhg-19k53-jeo1gz": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "",
            fontFamily: "",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "left",
          },
          props: {
            text: "Text Block",
            navigateToUrl: "",
          },
        },
      },
    },
  },
  {
    id: "template2",
    title: "Nature Theme",
    author: "John Doe",
    json: {
      root: {
        type: "EmailLayout",
        data: {
          style: {
            canvasColor: "#FFFFFF",
            textColor: "",
            fontFamily: "Modern Sans",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
          },
          childrenIds: [
            "m8fwpkhc-u9zre-40920",
            "m8fwpn2a-81cj6-5zyow",
            "m8fwphys-sx7nr-22djn",
            "m8fwphar-po738-1juhr",
          ],
        },
      },
      "m8fwpkhc-u9zre-40920": {
        type: "Divider",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            thickness: 2,
            dividerColor: "#808080",
            alignment: "left",
          },
        },
      },
      "m8fwpn2a-81cj6-5zyow": {
        type: "Button",
        data: {
          style: {
            backgroundColor: "",
            textAlign: "left",
            fontWeight: "400",
            fontFamily: "",
            fontSize: 16,
            color: "",
            buttonColor: "",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            buttonPadding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            width: 150,
            height: 50,
            borderWidth: 0,
            borderStyle: "none",
            borderColor: "",
            borderRadius: 0,
          },
          props: {
            text: "Add More Text",
            navigateToUrl: "",
            textAlign: "left",
          },
        },
      },
      "m8fwphys-sx7nr-22djn": {
        type: "Image",
        data: {
          style: {
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "left",
            width: 100,
            height: "",
            objectFit: "contain",
            borderWidth: 0,
            borderStyle: "none",
            borderColor: "",
            borderRadius: 0,
          },
          props: {
            imageUrl:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQNJgVPk88H7N4njkQXBGIBomyJly6uSngxQ&s",
            altText: "Block Image",
            navigateToUrl: "",
          },
        },
      },
      "m8fwphar-po738-1juhr": {
        type: "Text",
        data: {
          style: {
            fontWeight: "400",
            color: "",
            fontFamily: "",
            fontSize: 16,
            lineHeight: 16,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            padding: {
              top: 10,
              right: 10,
              bottom: 10,
              left: 10,
            },
            backgroundColor: "",
            textAlign: "left",
          },
          props: {
            text: "Text Block",
            navigateToUrl: "",
          },
        },
      },
    },
  },
  // Add your template objects here
];
