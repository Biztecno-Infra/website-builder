import { convertToHtml } from "./jsonToHTML";

export const convertJsonToHtml = async (jsonData: any) => {
  const rootData = jsonData?.root?.data;
  const blocksHtml = [];
  for (const childId of rootData?.childrenIds) {
    blocksHtml.push(
      await convertToHtml(
        jsonData[childId],
        jsonData,
        600 -
        (rootData.style?.padding?.left || 0) -
        (rootData.style?.padding?.right || 0)
      )
    );
  }

  const {
    fontFamily,
    canvasColor,
    textColor,
    padding = {},
    borderColor,
    borderRadius,
    borderWidth,
    borderStyle,
  } = rootData.style || {};

  const { top = 0, right = 0, bottom = 0, left = 0 } = padding;

  const rawHtml = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="x-apple-disable-message-reformatting" />
       <style>
        .responsive-table {
          width: 100%;
          max-width: 600px;
        }
        @media only screen and (max-width: 600px) {
          .responsive-table {
            width: 100% !important;
          }
          .stack-column,
          .stack-column td {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        .hide-mobile {
         display: block !important;
         mso-hide: all !important; /* Hide in Outlook */
       }

       .hide-desktop {
         display: block !important;
         mso-hide: all !important; /* Hide in Outlook */
       }

       @media only screen and (max-width: 600px) {
                .hide-mobile {
             display: none !important;
             max-height: 0 !important;
           overflow: hidden !important;
           mso-hide: all !important;  
           }
        }

     @media only screen and (min-width: 601px) {
       .hide-desktop {
         display: none !important;
         max-height: 0 !important;
         overflow: hidden !important;
         mso-hide: all !important;
       }
     }

      </style>
    </head>
    <body>
      <center>
        <table
          class="responsive-table"
          bgcolor="${canvasColor}"
          style="
            font-family: ${fontFamily};
            margin: 0 auto;
            table-layout:fixed;
            width:600px;
            max-width:600px;
            background-color: ${canvasColor};
            color: ${textColor};
            padding: ${top}px ${right}px ${bottom}px ${left}px;
            border: ${borderWidth}px ${borderStyle} ${borderColor};
            border-radius: ${borderRadius}px; "
        >
          <tbody>
            <tr>
              <td style="padding: 0;">
                ${blocksHtml.join("")}
              </td>
            </tr>
          </tbody>
        </table>
      </center>
    </body>
  </html>`;

  return rawHtml;
};
