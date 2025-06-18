export const ChartData = () => {
  return (
    <svg
      className="w-[24px] h-[24px] cursor-pointer  fill-white text-white hover:fill-[color:var(--Button-Gradient,#F7931A)] transition-all active:fill-[color:var(--Button-Gradient,yellow)]"
      focusable="false"
      color="white"
      aria-hidden="true"
      viewBox="0 0 24 24"
    >
      <path
        color="white"
        d="M9 4H7v2H5v12h2v2h2v-2h2V6H9zm10 4h-2V4h-2v4h-2v7h2v5h2v-5h2z"
      ></path>
    </svg>
  );
};

export default ChartData;
