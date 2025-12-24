import Swal from "sweetalert2";

/** 成功 / 失敗提示（自動消失） */
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
    width: "24rem",
    icon: isSuccess ? "success" : "error",
    title,
    text,
    showConfirmButton: false,
    timer: 1500,
  });
}

/** 確認型提示（回傳 boolean） */
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
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#aaa",
    width: "24rem",
  });

  return result.isConfirmed;
}
