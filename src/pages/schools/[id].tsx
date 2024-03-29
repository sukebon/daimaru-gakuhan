import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { FaTrashAlt } from "react-icons/fa";
import { useRecoilValue } from "recoil";
import { db } from "../../../firebase";
import { currentUserState } from "../../../store";
import { CSVLink } from "react-csv";
import TotalModal from "../../components/schools/TotalModal";
import StudentModal from "../../components/schools/StudentModal";
import SliderWidth from "../../components/SliderWidth";
import Link from "next/link";
import { StudentType } from "../../types/StudentType";

const SchoolId = () => {
  const router = useRouter();
  const projectId = router.query.id;
  const currentUser = useRecoilValue(currentUserState);
  const [students, setStudents] = useState<any>([] as StudentType[]);
  const [project, setProject] = useState<any>();
  const [totals, setTotals] = useState<any>();
  const [unRegister, setUnRegister] = useState("");
  const [deleteCheck, setDeleteCheck] = useState("");
  const [serchText, setSerchText] = useState("");
  const [csvData, setCsvData] = useState("");
  const [tableWidth, setTableWidth] = useState(1200);

  // ログインしてなければloginページへ移動
  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  //生徒の情報を取得
  useEffect(() => {
    const getStudents = async () => {
      if (!currentUser) return;
      const collectionRef = collection(
        db,
        "schools",
        `${projectId}`,
        "students"
      );
      const q = query(collectionRef, orderBy("serialNumber", "asc"));
      onSnapshot(q, (querySnapshot) => {
        setStudents(
          querySnapshot.docs
            .map(
              (doc) =>
                ({
                  ...doc.data(),
                  id: doc.id,
                } as StudentType)
            )
            ?.filter(
              (student) =>
                student.deletedFlag !== true &&
                student.studentNumber.includes(serchText)
            )
        );
      });
    };
    getStudents();
  }, [projectId, currentUser, serchText]);

  // 学販projectデータ取得
  useEffect(() => {
    if (!currentUser) return;
    const getProject = async () => {
      const docRef = doc(db, "projects", `${projectId}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject({ ...docSnap.data(), id: docSnap.id });
      }
    };
    getProject();
  }, [projectId, currentUser]);

  // 未登録の生徒数
  useEffect(() => {
    const getUnregister = () => {
      const result = students?.filter(
        (student: { updatedAt: Date }) => !student.updatedAt
      );
      setUnRegister(result?.length === 0 ? "" : result?.length);
    };
    getUnregister();
  }, [students]);

  //論理削除
  const deletedAtStudent = async (studentId: string) => {
    const result = window.confirm(
      `${getStudentName(studentId)}\nゴミ箱へ移して宜しいでしょうか`
    );
    if (!result) return;
    const docRef = doc(db, "schools", `${projectId}`, "students", studentId);
    await updateDoc(docRef, {
      deletedFlag: true,
    });
  };

  const getStudentName = (studentId: string) => {
    const findStudent = students.find(
      (student: StudentType) => student.id === studentId
    );
    return `${findStudent?.studentNumber} ${findStudent?.lastName} ${findStudent?.firstName}`;
  };

  //性別を表示
  const genderDisp = (gender: string) => {
    switch (gender) {
      case "1":
        return "男性";
      case "2":
        return "女性";
      default:
        return "未記入";
    }
  };

  // 作成日表示
  const getDateTime = (d: Date) => {
    const date = new Date(d);
    let month = String(date.getMonth() + 1);
    month = ("0" + month).slice(-2);
    let day = String(date.getDate());
    day = ("0" + day).slice(-2);
    let hours = String(date.getHours());
    hours = ("0" + hours).slice(-2);
    let min = String(date.getMinutes());
    min = ("0" + min).slice(-2);
    let sec = String(date.getSeconds());
    sec = ("0" + sec).slice(-2);
    return `${month}月${day}日${hours}:${min}:${sec}`;
  };

  // 経過時間
  const getElapsedtime = (before: Date, after: Date) => {
    const beforeTime = new Date(before).getTime();
    const afterTime = new Date(after).getTime();
    const elap = Math.floor((afterTime - beforeTime) / 1000);
    const hour = Math.floor(Number(elap) / 3600);
    let min = String(Math.floor((elap / 60) % 60));
    min = ("0" + min).slice(-2);
    let sec = String(Math.floor(elap % 60));
    sec = ("0" + sec).slice(-2);
    const result = `${hour}時間 ${min}分 ${sec}秒`;
    return result;
  };

  ////////////////// CSV作成 //////////////////////////////////
  const onClickCsv = () => {
    // 生徒を一人ひとりループしてデータを作成
    const csvData = students.map((student: any) => {
      // 商品毎にオブジェクト(obj)を作成して配列に格納
      let items = student?.products.map(
        (
          product: {
            productName: string;
            color: string;
            size: string;
            quantity: number;
            inseam: number;
          },
          index: number
        ) => {
          // keyの名前を作成
          const nameProduct = "商品名" + Number(index + 1);
          const nameColor = "カラー" + Number(index + 1);
          const nameSize = "サイズ" + Number(index + 1);
          const nameQuantity = "数量" + Number(index + 1);
          const nameInseam = "股下修理" + Number(index + 1);

          // keyに各項目名を入れてオブジェクトを作成
          const obj = {
            [nameProduct]: product.productName,
            [nameColor]: product.color || undefined,
            [nameSize]: product.size,
            [nameQuantity]: product.quantity,
            [nameInseam]: product.inseam || undefined,
          };

          // 値がundefindであれば削除
          const newObject = Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== undefined)
          );

          return newObject;
        }
      );

      // 生徒毎に各項目のオブジェクトを作成して配列に格納
      let array: any = [];
      items.forEach((obj: any) => {
        Object.keys(obj).forEach((key) => {
          array.push({ [key]: obj[key] });
        });
      });

      const gender = genderDisp(student?.gender);

      // 学生番号・名前などを配列に追加
      array.unshift(
        { 学籍番号: student.studentNumber },
        { 名前: student?.lastName + student?.firstName },
        { 性別: gender },
        { 金額: student?.sumTotal },
        { Email: student?.email },
        { 作成日: getDateTime(student?.createdAt?.toDate()) },
        {
          採寸完了日:
            student?.updatedAt && getDateTime(student?.updatedAt?.toDate()),
        },
        {
          経過時間:
            student?.updatedAt &&
            getElapsedtime(
              student?.createdAt?.toDate(),
              student?.updatedAt?.toDate()
            ),
        }
      );

      project?.isAddress &&
        array.push(
          {
            住所:
              "〒" +
              student?.postCode +
              " " +
              student?.address1 +
              student?.address2 +
              student?.address3 +
              student?.address4,
          },
          { tel: student?.tel1 + "-" + student?.tel2 + "-" + student?.tel3 }
        );

      return [...array];
    });

    // CSVファイルの項目を作成
    const header = csvData[0]
      .map((csv: any) => Object.keys(csv))
      .map((key: any) => key[0])
      .join(",");

    // CSVファイルの内容を作成
    const body = csvData
      .map((csv: any) =>
        csv
          .map((c: any) => Object.values(c))
          .map((value: any) => value[0])
          .join(",")
      )
      .join("\n");

    //　項目と内容を合わせてCSVファイルを作成
    const csvFile = header + "\n" + body;
    setCsvData(csvFile);
  };

  return (
    <Container maxW={`${tableWidth}px`} py={6}>
      {currentUser && (
        <>
          <SliderWidth
            tableWidth={tableWidth}
            setTableWidth={setTableWidth}
            width={1200}
          />
          <Box as="h2" mt={3} fontWeight="bold">
            {project?.title}
          </Box>
          <Flex
            gap={3}
            mt={3}
            alignItems="center"
            justifyContent="space-between"
            flexDirection={{ base: "column", md: "row" }}
          >
            <Box>
              全{students?.length}件
              {unRegister && (
                <Box as="span">{`（未提出者 ${unRegister}名）`}</Box>
              )}
            </Box>
            <Flex gap={3} alignItems="center">
              <Input
                size="sm"
                maxW="200px"
                rounded="md"
                bg="white"
                value={serchText}
                onChange={(e) => setSerchText(e.target.value)}
                placeholder="学籍番号で検索"
              />
              {serchText && (
                <Button
                  colorScheme="red"
                  size="sm"
                  onClick={(e) => setSerchText("")}
                >
                  解除
                </Button>
              )}
            </Flex>
            <Flex>
              <Link href={`/schools/limit/${projectId}`}>
                <a>
                  <Button size="sm" mr={2} colorScheme="facebook">
                    学生閲覧用ぺージ
                  </Button>
                </a>
              </Link>
              <Link href={`/schools/trash/${projectId}`}>
                <a>
                  <Button
                    size="sm"
                    mr={2}
                    variant="outline"
                    colorScheme="facebook"
                  >
                    ゴミ箱
                  </Button>
                </a>
              </Link>
              <CSVLink
                data={csvData}
                filename={
                  new Date().toLocaleString() + `_${project?.title}.csv`
                }
              >
                <Button
                  size="sm"
                  mr={2}
                  variant="outline"
                  colorScheme="facebook"
                  onClick={onClickCsv}
                >
                  CSV
                </Button>
              </CSVLink>
              {/* <TotalModal totals={totals} totalPrice={totalPrice} /> */}
            </Flex>
          </Flex>
          {students?.length > 0 ? (
            <>
              <TableContainer mt={6}>
                <Table variant="striped" colorScheme="gray" size="sm">
                  <Thead>
                    <Tr>
                      {deleteCheck && <Th>削除</Th>}
                      <Th>詳細</Th>
                      <Th>学生番号</Th>
                      <Th>名前</Th>
                      <Th>性別</Th>
                      <Th isNumeric>金額（税込）</Th>
                      {students[0]?.products.map(
                        (
                          product: {
                            productName: string;
                            color: string[];
                            size: string[];
                            quantity: string;
                            inseam: string;
                          },
                          index: number
                        ) => (
                          <React.Fragment key={index}>
                            {product?.productName && <Th w="80px">商品名</Th>}
                            {product?.color && <Th w="80px">カラー</Th>}
                            {product?.size && <Th w="80px">サイズ</Th>}
                            {product?.quantity && <Th w="50px">数量</Th>}
                            {product?.inseam && <Th w="50px">股下修理</Th>}
                          </React.Fragment>
                        )
                      )}
                      <Th>登録日</Th>
                      <Th>採寸完了日</Th>
                      <Th>経過時間</Th>
                      <Th>Email</Th>
                      {project?.isAddress && (
                        <>
                          <Th>住所</Th>
                          <Th>TEL</Th>
                        </>
                      )}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {students?.map((student: any) => (
                      <Tr
                        key={student.id}
                        fontWeight={student?.updatedAt || "bold"}
                        textColor={student?.updatedAt || "red.500"}
                      >
                        {deleteCheck && (
                          <Td>
                            <FaTrashAlt
                              cursor="pointer"
                              onClick={() =>
                                deleteCheck && deletedAtStudent(student.id)
                              }
                            />
                          </Td>
                        )}
                        <Td>
                          <StudentModal
                            projectId={student?.projectId}
                            studentId={student?.id}
                            genderDisp={genderDisp}
                            students={students}
                          />
                        </Td>
                        <Td>{student?.studentNumber}</Td>
                        <Td>{`${student?.lastName} ${student?.firstName}`}</Td>
                        <Td>{genderDisp(student.gender)}</Td>
                        <Td isNumeric>
                          {student.sumTotal
                            ? Math.round(
                                Number(
                                  student.sumTotal +
                                    (Number(student.isDelivery) === 1 &&
                                      student.deliveryCost)
                                )
                              ).toLocaleString()
                            : 0}
                          円
                        </Td>
                        {student.products.map((product: any, index: number) => (
                          <React.Fragment key={index}>
                            {product.productName && (
                              <Td w="80px">{product.productName}</Td>
                            )}
                            {product.color && (
                              <Td
                                w="80px"
                                textAlign="center"
                                fontWeight={
                                  product.color === "未記入" ? "bold" : ""
                                }
                                color={product.color === "未記入" ? "red" : ""}
                              >
                                {product.color}
                              </Td>
                            )}
                            {product.size && (
                              <Td
                                w="80px"
                                textAlign="center"
                                fontWeight={
                                  product.size === "未記入" ? "bold" : ""
                                }
                                color={product.size === "未記入" ? "red" : ""}
                              >
                                {product.size}
                              </Td>
                            )}
                            {product.quantity && (
                              <Td w="50px" textAlign="right">
                                {product.quantity}
                              </Td>
                            )}
                            {product.inseam && (
                              <Td
                                w="50px"
                                textAlign="right"
                                fontWeight={
                                  product.inseam === "未記入" ? "bold" : ""
                                }
                                color={product.inseam === "未記入" ? "red" : ""}
                              >
                                {product.inseam}
                              </Td>
                            )}
                          </React.Fragment>
                        ))}
                        <Td>{getDateTime(student?.createdAt.toDate())}</Td>
                        <Td>
                          {student?.updatedAt &&
                            getDateTime(student?.updatedAt.toDate())}
                        </Td>
                        <Td>
                          {student?.updatedAt &&
                            getElapsedtime(
                              student?.createdAt.toDate(),
                              student?.updatedAt.toDate()
                            )}
                        </Td>
                        <Td>{student?.email && student?.email}</Td>
                        {project?.isAddress && (
                          <>
                            <Td>{`〒${student.postCode} ${student.address1}${student.address2}${student.address3}${student.address4}`}</Td>
                            <Td>{`${student.tel1}-${student.tel2}-${student.tel3}`}</Td>
                          </>
                        )}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <Box mt={6}>
                <Checkbox
                  value={deleteCheck}
                  name="check"
                  onChange={(e: any) => setDeleteCheck(e.target.checked)}
                >
                  ゴミ箱へ移す場合はチェックを入れてください
                </Checkbox>
              </Box>
            </>
          ) : (
            <Box textAlign="center" mt={6}>
              現在、登録情報はありません。
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default SchoolId;
