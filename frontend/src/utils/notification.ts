import Swal from "sweetalert2";

/* -----------------------------
 * 共用 Dark Theme 設定
 * ---------------------------- */
const baseDarkSwal = {
  background: "rgba(15,15,15,0.92)",
  color: "#e5e5e5",
  width: "22rem",
  backdrop: `
    rgba(0,0,0,0.6)
    backdrop-filter: blur(6px)
  `,
  showClass: {
    popup: "swal2-show animate__animated animate__fadeInUp animate__faster",
  },
  hideClass: {
    popup: "swal2-hide animate__animated animate__fadeOutDown animate__faster",
  },
};

/* -----------------------------
 * 成功 / 失敗提示（自動消失）
 * ---------------------------- */
export function showSwal({
  isSuccess,
  title,
  text,
}: {
  isSuccess: boolean;
  title: string;
  text?: string;
}) {
  return Swal.fire({
    ...baseDarkSwal,
    icon: undefined, // ❌ 不用 icon
    showConfirmButton: false,
    timer: 1600,
    title,
    text,

    customClass: {
      title: `
        font-semibold
        uppercase
        text-base
        tracking-widest
      `,

      // ⭐ 只有在「真的有 text」時，才加間距樣式
      ...(text && {
        htmlContainer: `
          mt-2
          text-xs
          leading-relaxed
          text-gray-300
          opacity-80
        `,
      }),
    },
  });
}

/* -----------------------------
 * 確認型提示（回傳 boolean）
 * ---------------------------- */
export async function showConfirmSwal({
  title,
  text,
  confirmText,
  cancelText,
}: {
  title: string;
  text?: string;
  confirmText: string;
  cancelText: string;
}) {
  const result = await Swal.fire({
    ...baseDarkSwal,
    icon: undefined,
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    buttonsStyling: false,

    customClass: {
      title: `
        font-semibold
        uppercase
        text-base
        tracking-widest
      `,

      ...(text && {
        htmlContainer: `
          mt-2
          text-xs
          leading-relaxed
          text-gray-300
          opacity-75
        `,
      }),

      actions: "flex gap-3 mt-6",
      confirmButton: `
        px-4 py-2
        text-sm
        border border-primaryRed
        text-primaryRed
        hover:bg-primaryRed hover:text-black
        transition
      `,
      cancelButton: `
        px-4 py-2
        text-sm
        border border-gray-500
        text-gray-400
        hover:bg-gray-700
        transition
      `,
    },
  });

  return result.isConfirmed;
}
