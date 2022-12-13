import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createPresence } from '@yomo/presence/dist/index';
import './styles.css';

export type User = {
  id: string;
  avatar?: string;
};

@customElement('hug-group')
export default class HugGroup extends LitElement {
  @property()
  id: string = Math.random().toString();
  @property({
    converter: (attrValue: string | null) => {
      if (attrValue) return attrValue;
      else return 'https://avatars0.githubusercontent.com/u/17098?s=460&v=4';
    },
  })
  avatar;
  @property()
  users: User[] = [];
  @property()
  channel = null;

  createRenderRoot() {
    createPresence({
      url: 'https://prscd2.allegro.earth/v1',
      publicKey: 'BYePWMVCfkWRarcDLBIbSFzrMkDldWIBuKsA',
      id: this.id,
      appId: 'cc',
    }).then((yomo) => {
      this.channel = yomo.joinChannel('hug-group', {
        id: this.id,
        avatar: this.avatar,
      });

      this.channel.subscribePeers((peers) => {
        this.users = [{ id: this.id, avatar: this.avatar }, ...peers];
      });
      this.users = [{ id: this.id, avatar: this.avatar }];
    });
    window.addEventListener('beforeunload', () => {
      this.channel.leave();
    });
    return this; // turn off shadow dom to access external styles
  }
  render() {
    if (this.channel === null) return null;
    return html`
      <div class="flex items-center">
        <div
          class=" relative flex"
          style="margin-right: ${14 - Math.min(this.users.length, 6) * 2}px"
        >
          ${this.users.slice(0, 6).map((user, i) => {
            if (i < 5) {
              if (user.avatar) {
                return html`<img
                  style="transform:
                translateX(${i * -2}px);
                z-index:${this.users.length - i};
                width: 22px;
                height: 22px;
                object-fit: contain;
                border-radius: 50%;
                "
                  src=${user.avatar}
                  alt=${user.id}
                />`;
              }
              return html`
                <svg
                  style="transform: translateX(${i * -2}px);z-index:${this.users
                    .length - i}"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="10.5"
                    fill="url(#pattern0)"
                    stroke="#604CFF"
                  />
                  <defs>
                    <pattern
                      id="pattern0"
                      patternContentUnits="objectBoundingBox"
                      width="1"
                      height="1"
                    >
                      <use
                        xlink:href="#image0_351_157"
                        transform="scale(0.0238095)"
                      />
                    </pattern>
                    <image
                      id="image0_351_157"
                      width="42"
                      height="42"
                      xlink:href="data:image/png;base64,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"
                    />
                  </defs>
                </svg>
              `;
            } else {
              return html` <div
                style="transform: translateX(${i * -2}px);
                z-index:${this.users.length - i};  
                "
                class="relative w-[22px] h-[22px]
                text-white text-[12px]
                font-[500] font-normal"
              >
                <span
                  class="absolute inline-flex  justify-center items-center w-full h-full  rounded-full"
                  style="background: rgba(0, 0, 0, 0.6);"
                  >+${this.users.length - 5}</span
                >
                <svg
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="10.5"
                    fill="url(#pattern0)"
                    stroke="#604CFF"
                  />
                  <defs>
                    <pattern
                      id="pattern0"
                      patternContentUnits="objectBoundingBox"
                      width="1"
                      height="1"
                    >
                      <use
                        xlink:href="#image0_351_157"
                        transform="scale(0.0238095)"
                      />
                    </pattern>
                    <image
                      id="image0_351_157"
                      width="42"
                      height="42"
                      xlink:href="data:image/png;base64,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"
                    />
                  </defs>
                </svg>
              </div>`;
            }
          })}
        </div>
        <div
          class="flex rounded-[1rem] py-1 px-2"
          style="background: linear-gradient(115.54deg, #7787FF 30.62%, #E080C9 83.83%);"
        >
          <span class="font-normal leading-4 text-[0.75rem] text-white mr-[2px]"
            >live</span
          >
          <span
            class="flex justify-center items-center text-[0.75rem] text-[#604CFF] rounded-full w-4 h-4 bg-white"
            >${this.users.length}</span
          >
        </div>
      </div>
    `;
  }
}
