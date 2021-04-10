/**
 * Stolen from https://github.com/Stonks2Moon/Boerse/blob/main/src/SwaggerCSS.ts
 */
export const swaggerCss = `

.swagger-ui, html {
  font-family: -apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol !important;
  scroll-behavior: smooth;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  background: #111;
  color: #fff;
}

.swagger-ui .dialog-ux .modal-ux-content p {
  color: #fff;
  font-size: 16px;
}

.swagger-ui label {
  display: none;
}

.swagger-ui .dialog-ux .modal-ux-content h4 {
  color: #fff;
}

.swagger-ui .dialog-ux .modal-ux-header h3 {
  color: #fff;
}

.swagger-ui .dialog-ux .modal-ux {
  background: black;
}

.swagger-ui .scheme-container {
  background: black;
}

.swagger-ui .opblock-tag {
  border-color: rgba(255, 255, 255, 0.3)
}

.swagger-ui .info .title {
  color: #fff;
}

.swagger-ui .info p {
  color: #fff;
}

.swagger-ui section.models .model-container {
  background: rgba(31, 32, 36, 0.5) !important;
}

.swagger-ui .model-toggle {
  filter: invert(100%) !important;
}

.swagger-ui .model {
  color: #fff;
}

.swagger-ui .prop-type {
  color: #08f;
}

.swagger-ui .btn.execute {
  background: #08f;
}

.swagger-ui .opblock .opblock-section-header {
  background: rgba(17, 17, 17, 0.5);
}

.swagger-ui .btn {
  border-color: #fff;
  color: #fff;
}

.swagger-ui .opblock-description-wrapper p {
  color: #fff;
}

.swagger-ui .opblock .opblock-section-header h4 {
  color: #fff;
}

.swagger-ui .parameter__name,
.swagger-ui .parameter__type,
.swagger-ui .tab li {
  color: #fff;
}

.swagger-ui select {
  display: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: #111;
  padding-right: 10px;
  color: #fff;
  min-width: unset !important;
}

.swagger-ui .model-box {
  background: rgba(17, 17, 17, 0.75)
}

.swagger-ui .model .property.primitive {
  color: rgba(255, 255, 255, 0.5);
}

.swagger-ui table thead tr th,
.swagger-ui table thead tr td,
.swagger-ui .response-col_status,
.swagger-ui .response-col_links,
.swagger-ui .responses-inner h4,
.swagger-ui .responses-inner h5 {
  color: rgba(255, 255, 255, 0.75);
}

pre:not([class^="version"]) {
  background: #111 !important;
}

span {
  color: #fff;
}

svg {
  fill: #fff;
}

body {
  margin: 0;
}

textarea, input {
  background: #28292d !important;
  color: #fff !important;
}

.topbar {
  display: none;
}


.swagger-ui .opblock.opblock-patch {
  background: rgba(241, 196, 15, 0.1);
  border-color: #f1c40f;
}
.swagger-ui .opblock.opblock-patch .tab-header .tab-item.active h4 span:after,
.swagger-ui .opblock.opblock-patch .opblock-summary-method {
  background: #f1c40f;
}
.swagger-ui .opblock.opblock-patch .opblock-summary {
  border-color: #f1c40f;
}



.swagger-ui .opblock.opblock-get {
  background: rgba(0, 136, 255, 0.1);
  border-color: #08f;
}
.swagger-ui .opblock.opblock-get .tab-header .tab-item.active h4 span:after,
.swagger-ui .opblock.opblock-get .opblock-summary-method {
  background: #08f;
}
.swagger-ui .opblock.opblock-get .opblock-summary {
  border-color: #08f;
}



.swagger-ui .opblock.opblock-post {
  background: rgba(37, 202, 73, 0.1);
  border-color: #25ca49;
}
.swagger-ui .opblock.opblock-post .tab-header .tab-item.active h4 span:after,
.swagger-ui .opblock.opblock-post .opblock-summary-method {
  background: #25ca49;
}
.swagger-ui .opblock.opblock-post .opblock-summary {
  border-color: #25ca49;
}



.swagger-ui .opblock.opblock-delete {
  background: rgba(255, 71, 87, 0.1);
  border-color: #ff4757;
}
.swagger-ui .opblock.opblock-delete .tab-header .tab-item.active h4 span:after,
.swagger-ui .opblock.opblock-delete .opblock-summary-method {
  background: #ff4757;
}
.swagger-ui .opblock.opblock-delete .opblock-summary {
  border-color: #ff4757;
}

::-webkit-scrollbar-thumb {
  background: #666;
}
::-webkit-scrollbar-thumb:hover {
  background: #888;
}
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  position: absolute !important;
  border-radius: 4px;
  transition: 0.2s ease;
}
::-webkit-scrollbar-thumb {
  transition: 0.2s ease;
  border-radius: 4px;
}
`;
