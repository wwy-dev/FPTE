import { FluxDispatcher } from "@lib/flux";
import { UserProfileStore, UserStore } from "@lib/stores";
import {
    patchGetPurchase,
    patchGetUserProfile,
    patchUseProfileEffectSections,
    patchUseProfileTheme,
    patchUserProfileEditForm,
    patchNitroUpsellCard
} from "@patches";
import { Settings } from "@ui/pages";

/** Updates the profile theme and effect used by YouScreen and BottomTabBar. */
function updateProfileThemeAndEffect() {
    try {
        const user = UserStore?.getCurrentUser?.();
        if (!user) return;
        const user_profile = UserProfileStore?.getUserProfile?.(user.id);
        if (!user_profile) return;
        FluxDispatcher?.dispatch({
            type: "USER_PROFILE_FETCH_SUCCESS",
            user,
            user_profile,
            connected_accounts: user_profile.connectedAccounts
        });
    } catch (e) {
        console.error("[FPTE] Error actualizando perfil:", e);
    }
}

const patches: (() => boolean)[] = [];

function safePatch(patchFn: any) {
    try {
        const res = patchFn();
        if (Array.isArray(res)) {
            res.forEach(p => typeof p === "function" && patches.push(p));
        } else if (typeof res === "function") {
            patches.push(res);
        }
    } catch (err) {
        console.error("[FPTE] Error al aplicar parche:", err);
    }
}

export default {
    onLoad() {
        safePatch(patchGetPurchase);
        safePatch(patchGetUserProfile);
        safePatch(patchUseProfileEffectSections);
        safePatch(patchUseProfileTheme);
        safePatch(patchUserProfileEditForm);
        safePatch(patchNitroUpsellCard);

        updateProfileThemeAndEffect();
    },
    onUnload() {
        patches.forEach(unpatch => {
            try {
                if (typeof unpatch === "function") unpatch();
            } catch (e) {
                console.error("[FPTE] Error al desparchear:", e);
            }
        });
        updateProfileThemeAndEffect();
    },
    settings: Settings
};
