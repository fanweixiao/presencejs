import React, { createContext, useContext, useEffect, useState } from 'react';
import { IChannel } from '@yomo/presence';
import { GroupHugProps, User } from './types.d';

const colors = [
  '#FF38D1',
  '#8263FF',
  '#0095FF',
  '#00B874',
  '#FF3168',
  '#FFAB03',
];

const sizes = {
  md: 24, // 24 + 2 * 4 = 32
};

const GroupHugCtx = createContext<{
  users: User[];
  self: User;
  size: number;
  darkMode: boolean;
} | null>(null);

export default function GroupHug(
  props: GroupHugProps & typeof GroupHugDefaultProps
) {
  const { id, avatar, darkMode } = props;
  let { avatarBorderColor, name } = props;
  const size = sizes[props.size];
  if (!avatarBorderColor) {
    let idx = Math.floor(Math.random() * colors.length);
    avatarBorderColor = colors[idx];
  }
  const [myState, setMyState] = useState<User>({
    id,
    avatar,
    state: 'online',
    avatarBorderColor,
    name,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    let channel: IChannel | null = null;
    props.presence.then(yomo => {
      channel = yomo.joinChannel('group-hug', myState);

      channel.subscribePeers(peers => {
        setUsers([
          myState,
          ...(peers as User[]).filter(peer => 'avatar' in peer),
        ]);
      });

      setUsers([myState]);
      setConnected(true);
    });

    const visibilitychangeCb = () => {
      if (document.hidden) {
        const newState: User = { ...myState, state: 'away' };
        channel?.updateMetadata(newState);
        setMyState(newState);
      } else {
        const newState: User = { ...myState, state: 'online' };
        channel?.updateMetadata(newState);
        setMyState(newState);
      }
    };
    document.addEventListener('visibilitychange', visibilitychangeCb);

    return () => {
      document.removeEventListener('visibilitychange', visibilitychangeCb);
    };
  }, []);

  if (!connected) {
    return <div></div>;
  }

  return (
    <GroupHugCtx.Provider
      value={{
        size,
        users,
        self: myState,
        darkMode,
      }}
    >
      <div
        className={`relative flex ${darkMode ? 'dark' : ''}`}
        style={{
          marginRight: `${14 - Math.min(users.length, 6) * 2}px`,
        }}
      >
        {users.slice(0, 6).map((user, i) => {
          if (i < 5) {
            return (
              <Avatar
                key={user.id}
                style={{
                  transform: `translateX(${i * -8}px)`,
                  zIndex: `${i}`,
                }}
                user={user}
              />
            );
          }
        })}
        {users.length > 5 && <Others size={size} users={users} />}
      </div>
    </GroupHugCtx.Provider>
  );
}

function ImageAvatar({ user }) {
  const ctx = useContext(GroupHugCtx);
  const { size } = ctx!;
  return (
    <>
      <img
        style={{
          minWidth: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          // opacity: `${user.state === 'away' ? '0.5' : '1'}`,
          border: `2px solid ${user.avatarBorderColor}`,
        }}
        src={user.avatar}
        alt={user.id}
        className="box-content relative bg-white rounded-full"
      />
      {user.state === 'away' && <Mask />}
    </>
  );
}

function TextAvatar({ user }) {
  const ctx = useContext(GroupHugCtx);
  const { size } = ctx!;
  if (!!!user.name) return null;
  return (
    <>
      <div
        style={{
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
          lineHeight: `${size}px`,
          background: `${user.avatarBorderColor}`,
          border: `2px solid ${user.avatarBorderColor}`,
          fontSize: '14px',
        }}
        className="box-content text-center text-black bg-white rounded-full"
      >
        {user.name.charAt(0)}
      </div>

      {user.state === 'away' && <Mask />}
    </>
  );
}

function Others({ size, users }) {
  const [display, setDisplay] = useState(false);

  return (
    <div
      className="rounded-full border-[2px] border-white z-10 cursor-pointer dark:border-black"
      style={{ transform: `translateX(${5 * -8}px)` }}
    >
      <div
        style={{
          minWidth: `${size}px`,
          width: `${size}px`,
          height: `${size}px`,
        }}
        className={`box-content relative text-[#666666] text-[12px] font-[500]
      border-[#999999]
      dark:border-[#666666]
      dark:text-[#DDDDDD]
      border-2
      rounded-full
      hover:border-[#000000]
      hover:text-[#000000]
      dark:hover:border-[#ffffff]
      dark:hover:text-[#ffffff]
      ${display ? 'bg-[#EAEAEA] dark:bg-[#333333]' : 'bg-white dark:bg-black'}`}
      >
        <span
          className="absolute inline-flex items-center justify-center w-full h-full rounded-full "
          onClick={() => setDisplay(!display)}
        >
          +{users.length - 5}
        </span>

        <span
          className="flex flex-col items-end
           absolute text-[14px] whitespace-nowrap font-[400]"
          style={{
            top: `${size + 8 + 5 / 2}px`,
            display: display ? '' : 'none',
            right: `0`,
          }}
        >
          <div
            className="w-[10px] h-[10px]
            bg-[white] dark:bg-[#34323E]
            shadow-[0px_0px_2px_0px_rgb(0_0_0_/_0.1)] z-10"
            style={{
              transform: `translateX(calc(-${size}px / 2 + 10px / 2)) rotate(135deg)`,
            }}
          ></div>
          <div
            className="absolute w-[12px] h-[12px]
            bg-[white] dark:bg-[#34323E]
            top-[0.5px] z-10"
            style={{
              transform: `translateX(calc(-${size}px / 2 + 10px / 2)) rotate(135deg)`,
            }}
          ></div>

          <div className="bg-white dark:bg-[#34323E] p-[10px] shadow-[0px_1px_4px_0px_rgb(0_0_0_/_0.1)] rounded-[6px] -translate-y-[5px]">
            {users.slice(5, users.length).map(user => (
              <div
                key={user.id}
                className="flex items-center gap-2 p-[10px]
              dark:hover:bg-[#414251] hover:bg-[#F5F5F5] rounded-[6px]"
              >
                <Avatar
                  user={user}
                  useTip={false}
                  style={{
                    border: 'none',
                  }}
                />
                <span className="text-black dark:text-white">{user.name}</span>
              </div>
            ))}
          </div>
        </span>
      </div>
    </div>
  );
}

function Tip({ display, name, id }) {
  const ctx = useContext(GroupHugCtx);
  const { size, self } = ctx!;
  return (
    <div
      className="flex flex-col items-center absolute text-[14px]
      text-black dark:text-white
      font-[400]
      "
      style={{
        top: `${size + 8 + 5}px`,
        display: display ? '' : 'none',
        transform: `translateX(calc(-50% + ${size / 2}px))`,
      }}
    >
      <div
        className="w-[10px] h-[10px]
bg-[white] dark:bg-[#34323E]
shadow-[0px_0px_2px_0px_rgb(0_0_0_/_0.1)]
rotate-[135deg] z-10
    "
      ></div>
      <div
        className="absolute w-[12px] h-[12px]
bg-[white] dark:bg-[#34323E]
top-[0.5px]
rotate-[135deg] z-10
    "
      ></div>
      <span
        className=" bg-white dark:bg-[#34323E] p-2 rounded-[6px] whitespace-nowrap 
      shadow-[0px_1px_4px_0px_rgb(0_0_0_/_0.1)] -translate-y-[5px]"
      >{`${name} ${id === self.id ? '(you)' : ''}`}</span>
    </div>
  );
}

function Avatar({
  style = {},
  user,
  useTip = true,
}: {
  style?: any;
  user: User;
  useTip?: boolean;
}) {
  const [display, setDisplay] = useState(false);
  return (
    <div
      style={style}
      className="relative rounded-full border-[2px] border-white dark:border-black select-none"
      onMouseEnter={() => {
        setDisplay(true);
      }}
      onMouseLeave={() => {
        setDisplay(false);
      }}
    >
      {user.avatar ? <ImageAvatar user={user} /> : <TextAvatar user={user} />}
      {useTip && <Tip display={display} name={user.name} id={user.id} />}
    </div>
  );
}

function Mask() {
  return (
    <span
      className="absolute top-[0px] left-[0px] 
      bg-white dark:bg-black opacity-60 rounded-full"
      style={{
        width: `calc(100%)`,
        height: `calc(100%)`,
      }}
    ></span>
  );
}

export const GroupHugDefaultProps = {
  size: 'md',
  avatar: '',
  grouped: true,
  darkMode: false,
};

GroupHug.defaultProps = GroupHugDefaultProps;
