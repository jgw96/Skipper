export async function checkPlusSub() {
    // if (window.location.hostname === "localhost") {
    //     return true;
    // }

    const { get } = await import("idb-keyval");

    const plusSub = await get("plus-sub");
    console.log("plusSub", plusSub)

    return plusSub ? true : false;
}