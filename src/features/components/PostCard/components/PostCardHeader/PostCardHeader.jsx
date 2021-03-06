import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Avatar, Group, Menu, Stack, Text } from "@mantine/core";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import {
	deletePost,
	selectAllUsers,
	selectProfileData,
	setProfileData,
	unFollowUser,
} from "../../../../../app/slices";
import { useIcons } from "../../../../../hooks";

TimeAgo.addLocale(en);
const timeAgo = new TimeAgo("en-US");

const getHeaderDetails = (currentUser, singleUser, userId) => {
	const temp = {};
	const isCurrentUser = currentUser.uid === userId;
	if (!!singleUser?.uid || isCurrentUser) {
		["avatarUrl", "fullName", "username"].forEach((ele) => {
			isCurrentUser
				? (temp[ele] = currentUser[ele])
				: (temp[ele] = singleUser[ele]);
		});
		temp.isFollowing = isCurrentUser
			? null
			: currentUser.following.includes(singleUser?.uid);
	}
	return temp;
};

export const PostCardHeader = ({
	uploadDate,
	userId,
	postId,
	setEditModalOpen,
	hasPhoto,
}) => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const getIcons = useIcons();
	const currentUser = useSelector(selectProfileData);
	const allUsers = useSelector(selectAllUsers);
	const singleUser = allUsers.find((user) => user.uid === userId);

	const { fullName, avatarUrl, username, isFollowing } = getHeaderDetails(
		currentUser,
		singleUser,
		userId
	);

	const isCurrentUser = userId === currentUser?.uid;

	const deleteHandler = (e) => {
		e.stopPropagation();
		dispatch(
			deletePost({
				postId,
				userId,
				hasPhoto,
			})
		);

		dispatch(
			setProfileData({
				posts: [...currentUser.posts].filter((uid) => uid !== postId),
			})
		);
	};

	const unFollowUserHandler = () => {
		dispatch(
			unFollowUser({
				currentUserID: currentUser?.uid,
				followedUserID: singleUser?.uid,
			})
		);
		dispatch(
			setProfileData({
				following: [
					...currentUser.following.filter(
						(ele) => ele !== singleUser?.uid
					),
				],
			})
		);
	};

	return (
		<Group
			position="apart"
			sx={(theme) => ({
				gap: theme.spacing.lg,
			})}>
			<Group
				sx={{
					cursor: "pointer",
				}}
				onClick={() => navigate(`/profile/${userId}`)}>
				<Avatar size="lg" alt="profile of user" src={avatarUrl} />
				<Stack sx={{ gap: 0 }}>
					<Text
						transform="uppercase"
						sx={{ wordWrap: "anywhere" }}
						lineClamp={1}>
						{fullName}
					</Text>
					<Text
						sx={{ wordWrap: "anywhere" }}
						size="sm"
						lineClamp={1}
						color="dimmed">
						{`@${username}`}
					</Text>
					<Text
						sx={{ wordWrap: "anywhere" }}
						size="xs"
						lineClamp={1}
						color="gray">
						{timeAgo.format(
							typeof uploadDate?.toDate === "function"
								? uploadDate?.toDate()
								: new Date()
						)}
					</Text>
				</Stack>
			</Group>
			{(isFollowing || isCurrentUser) && (
				<Menu
					control={
						<ActionIcon size="lg" variant="transparent">
							{getIcons("menu", 20)}
						</ActionIcon>
					}
					closeOnScroll
					zIndex="99"
					withArrow
					withinPortal
					position="left"
					gutter={10}
					transition="rotate-left">
					{isCurrentUser ? (
						<>
							<Menu.Item
								onClick={() => setEditModalOpen(true)}
								icon={getIcons("edit", 20)}>
								Edit
							</Menu.Item>
							<Menu.Item
								onClick={(e) => deleteHandler(e)}
								icon={getIcons("delete", 20)}>
								Delete
							</Menu.Item>
						</>
					) : (
						<>
							<Menu.Item
								onClick={() => unFollowUserHandler()}
								icon={getIcons("unfollow", 18)}>
								Unfollow
							</Menu.Item>
						</>
					)}
				</Menu>
			)}
		</Group>
	);
};
