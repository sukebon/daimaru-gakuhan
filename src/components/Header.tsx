import { Box, Button, Container, Flex, Text } from "@chakra-ui/react";
import React from "react";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useRecoilState } from "recoil";
import { currentUserState } from "../../store";
import { useRouter } from "next/router";

const Header = () => {
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const router = useRouter();

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        setCurrentUser("");
        console.log("loguot");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const menuElement = (path: string, title: string) => (
    <Link href={path}>
      <a>
        <Text
          fontSize="xs"
          colorScheme="gray"
          py={3}
          borderBottom="2px"
          borderBottomColor={router.pathname === path ? "black" : "#ff2e2e00"}
          _hover={{ opacity: 0.8 }}
        >
          {title}
        </Text>
      </a>
    </Link>
  );

  return (
    <>
      {currentUser && (
        <>
          <Container maxW="1200">
            <Flex
              as="header"
              alignItems="center"
              justifyContent="space-between"
              w="100%"
              h="60px"
            >
              <Link href="/dashboard">
                <a>
                  <Text fontWeight="bold">学販採寸アプリ</Text>
                </a>
              </Link>

              <Box>
                <Button size="sm" variant="ghost" onClick={signOutUser}>
                  ログアウト
                </Button>
              </Box>
            </Flex>
          </Container>
          <Box
            w="100%"
            position="sticky"
            top={0}
            zIndex={100}
            bgColor="white"
            borderBottom="1px"
            borderColor="gray.100"
          >
            <Container maxW="1200">
              <Flex w="100%" gap={6}>
                {menuElement("/dashboard", "ダッシュボード")}
                {menuElement("/signature", "署名一覧")}
                {menuElement("/colors", "色一覧")}
              </Flex>
            </Container>
          </Box>
        </>
      )}
    </>
  );
};

export default Header;
