function SideMenu(props) {
  return (
    <div className="group flex h-screen w-16 flex-col justify-between border-e bg-white transition-all duration-300 hover:w-64">
      <div className="px-4 py-6">
        <span className="grid h-10 w-full place-content-center rounded-lg bg-gray-100 text-xs text-gray-600 transition-all duration-300 group-hover:w-32">
          Logo
        </span>

        <ul className="mt-6 space-y-1">
          <li>
            <a
              href="#"
              className="flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h11M9 21V3m6 18v-8m6 8v-4"
                />
              </svg>
              <span className="hidden group-hover:inline">General</span>
            </a>
          </li>
        </ul>
      </div>

      <div className="sticky inset-x-0 bottom-0 border-t border-gray-100 bg-white">
        <a href="#" className="flex items-center gap-3 p-4 hover:bg-gray-50">
          <img
            alt="Profile"
            src="https://imgs.search.brave.com/LDwOkxgcaKvNTB3Vec9RONC9VujRf4rLOs05AS7i0jw/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvOTE2/MjY0ODcvcGhvdG8v/ZnVubnkta2l0dGVu/LmpwZz9zPTYxMng2/MTImdz0wJms9MjAm/Yz05RnR1X3JOUXBm/V2hZa21RenZDMnhf/LXlHS2hvSm16VUJl/bU00QWxhV1l3PQ"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="hidden group-hover:block">
            <p className="text-xs">
              <strong className="block font-medium">{props.userName}</strong>
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}
export default SideMenu;
