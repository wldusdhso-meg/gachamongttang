package com.meg.gachamongddang.server.service

import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.mock.web.MockMultipartFile
import org.springframework.test.util.ReflectionTestUtils
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

class FileStorageServiceTest {

    private lateinit var fileStorageService: FileStorageService
    private lateinit var testUploadDir: Path

    @BeforeEach
    fun setUp() {
        testUploadDir = Paths.get("test-uploads")
        Files.createDirectories(testUploadDir)
        
        fileStorageService = FileStorageService("test-uploads")
    }

    @AfterEach
    fun tearDown() {
        // 테스트 디렉토리 정리
        if (Files.exists(testUploadDir)) {
            Files.walk(testUploadDir)
                .sorted(Comparator.reverseOrder())
                .forEach { Files.deleteIfExists(it) }
        }
    }

    @Test
    fun `storeFile - 파일 저장 성공`() {
        // given
        val file = MockMultipartFile(
            "file",
            "test.jpg",
            "image/jpeg",
            "test image content".toByteArray()
        )

        // when
        val imageUrl = fileStorageService.storeFile(file)

        // then
        assertTrue(imageUrl.startsWith("/uploads/"))
        assertTrue(imageUrl.contains("test.jpg"))
        
        // 파일이 실제로 저장되었는지 확인
        val fileName = imageUrl.substring("/uploads/".length)
        val savedFile = testUploadDir.resolve(fileName)
        assertTrue(Files.exists(savedFile))
        assertEquals("test image content", String(Files.readAllBytes(savedFile)))
    }

    @Test
    fun `storeFile - UUID가 포함된 파일명 생성`() {
        // given
        val file = MockMultipartFile(
            "file",
            "original.jpg",
            "image/jpeg",
            "content".toByteArray()
        )

        // when
        val imageUrl1 = fileStorageService.storeFile(file)
        val imageUrl2 = fileStorageService.storeFile(file)

        // then
        assertNotEquals(imageUrl1, imageUrl2) // UUID가 다르므로 파일명이 달라야 함
        assertTrue(imageUrl1.contains("original.jpg"))
        assertTrue(imageUrl2.contains("original.jpg"))
    }
}

