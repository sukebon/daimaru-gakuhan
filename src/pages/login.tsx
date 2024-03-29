import React, { useEffect, useState } from "react";
import { Box, Button, Container, Flex, Input, Text } from "@chakra-ui/react";
import { FaLock } from "react-icons/fa";
import { signInWithEmailAndPassword, User } from "firebase/auth";
import { auth } from "../../firebase/index";
import { useRouter } from "next/router";
import { currentUserState, loadingState } from "../../store";
import { useRecoilState, useSetRecoilState } from "recoil";

const Login = () => {
  const router = useRouter();
  const setLoading = useSetRecoilState(loadingState);
  const [account, setAccount] = useState({
    email: "",
    password: "",
  });
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  useEffect(() => {
    if (currentUser) {
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // サインイン
  const signInUser = () => {
    setLoading(true);
    signInWithEmailAndPassword(auth, account.email, account.password)
      .then((userCredential) => {
        const user = userCredential.user;
        setCurrentUser(user?.uid);
        router.push("/dashboard");
      })
      .catch((error) => {
        console.log(error.code);
        console.log(error.message);
        window.alert("失敗しました");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setAccount({ ...account, [name]: value });
  };

  return (
    <Flex
      w="100%"
      h="100vh"
      alignItems="center"
      justifyContent="center"
      px={6}
      position="relative"
      bgColor="#fafafa"
    >
      <Container
        maxW="400px"
        p={6}
        pb={10}
        borderRadius={6}
        boxShadow="base"
        bgColor="white"
      >
        <Flex
          w="100%"
          h="70px"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          fontSize="2xl"
        >
          <Box>
            <FaLock />
          </Box>
          <Box mt={1}>Sign in</Box>
        </Flex>
        <Flex
          flexDirection="column"
          justifyContent="space-around"
          mt={3}
          px={6}
        >
          <Input
            type="text"
            w="100%"
            mt={0}
            backgroundColor="rgb(232 240 254)"
            placeholder="メールアドレス"
            name="email"
            value={account.email}
            onChange={handleChange}
          />
          <Input
            type="password"
            w="100%"
            mt={3}
            backgroundColor="rgb(232 240 254)"
            placeholder="パスワード"
            name="password"
            value={account.password}
            onChange={handleChange}
          />

          <Button
            mt={3}
            color="white"
            bgColor="facebook.900"
            _hover={{ backgroundColor: "facebook.500" }}
            disabled={!account.email || !account.password}
            onClick={signInUser}
          >
            サインイン
          </Button>
          {/* <Box my={3} fontSize="xs" color="whiteAlpha.900" textAlign="center">
            アカウントをお持ちでないですか？
            <Link href="/register">
              <a>
                <Text
                  as="span"
                  ml={2}
                  textDecoration="underline"
                  cursor="pointer"
                >
                  新規登録
                </Text>
              </a>
            </Link>
          </Box> */}
        </Flex>
      </Container>
    </Flex>
  );
};

export default Login;
