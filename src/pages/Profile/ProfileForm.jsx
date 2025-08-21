const [avatar, setAvatar] = useState(user?.avatar || "");

const handleAvatarChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    setAvatar(e.target.files[0]);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("email", email);
  if (avatar && typeof avatar !== "string") {
    formData.append("avatar", avatar);
  }
  // ...axios PUT vers /api/profile...
};

<Avatar
  src={
    avatar
      ? typeof avatar === "string"
        ? avatar.startsWith("http")
          ? avatar
          : `http://localhost:5000${avatar}`
        : URL.createObjectURL(avatar)
      : "/default-avatar.png"
  }
  sx={{ width: 80, height: 80 }}
/>
<Button component="label">
  Changer l’avatar
  <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
</Button>
