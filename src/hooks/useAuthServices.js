import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	signOut,
} from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import {
	removeProfileData,
	setProfileData,
	setProfileLoading,
} from "../app/slices";
import { auth, db } from "../firebase";

export const useAuthServices = () => {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const handleSignUp = async ({ email, password, fullName, username }) => {
		try {
			dispatch(setProfileLoading(true));
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email.trim(),
				password.trim()
			);
			const userDetails = {
				email: userCredential.user.email,
				uid: userCredential.user.uid,
				avatarUrl: "",
				username,
				fullName,
				bio: "",
				bannerUrl: "",
				posts: [],
				followers: [],
				following: [],
				bookmarked: [],
				website: "",
			};
			const userRef = doc(
				collection(db, "users"),
				userCredential.user.uid
			);
			await setDoc(userRef, {
				...userDetails,
			});
			dispatch(
				setProfileData({
					...userDetails,
				})
			);
		} catch (error) {
			const errorMessage = error.message;
			console.log({ errorMessage });
		} finally {
			dispatch(setProfileLoading(false));
		}
	};

	const handleSignIn = async ({ email, password }) => {
		try {
			dispatch(setProfileLoading(true));
			signInWithEmailAndPassword(auth, email.trim(), password.trim());
			navigate({
				pathname: "/",
			});
		} catch (error) {
			const errorMessage = error.message;
			console.log({ errorMessage });
		} finally {
			dispatch(setProfileLoading(false));
		}
	};

	const handleSignOut = async () => {
		try {
			await signOut(auth);
			dispatch(removeProfileData());
			navigate({
				pathname: "/sign-in",
				state: { from: "/" },
			});
			localStorage.removeItem("myToken");
		} catch (error) {
			const errorMessage = error.message;
			console.log({ errorMessage });
		} finally {
			dispatch(setProfileLoading(false));
		}
	};

	return {
		handleSignUp,
		handleSignIn,
		handleSignOut,
	};
};
