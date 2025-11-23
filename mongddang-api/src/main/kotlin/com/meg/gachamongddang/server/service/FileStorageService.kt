package com.meg.gachamongddang.server.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.util.UUID

@Service
class FileStorageService(
    @Value("\${app.upload.dir:uploads}")
    private val uploadDir: String
) {
    private val uploadPath: Path = Paths.get(uploadDir)
    
    init {
        Files.createDirectories(uploadPath)
    }
    
    fun storeFile(file: MultipartFile): String {
        val fileName = "${UUID.randomUUID()}_${file.originalFilename}"
        val filePath = uploadPath.resolve(fileName)
        Files.copy(file.inputStream, filePath)
        return "/uploads/$fileName"
    }
}

