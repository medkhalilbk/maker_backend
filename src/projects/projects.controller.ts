import { PartialType } from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/project.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('coverImage', 1, {
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          return cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @UploadedFiles() imageFile: Express.Multer.File,
  ) {
    // Parse the stringified arrays
    if (typeof createProjectDto.technologies === 'string') {
      createProjectDto.technologies = JSON.parse(createProjectDto.technologies);
    }

    if (typeof createProjectDto.categories === 'string') {
      createProjectDto.categories = JSON.parse(createProjectDto.categories);
    }

    if (imageFile) {
      createProjectDto.coverImage = `/uploads/projects/${imageFile[0].filename}`;
    }

    return this.projectsService.create(createProjectDto);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    if (typeof updateProjectDto?.technologies === 'string') {
      updateProjectDto.technologies = JSON.parse(
        updateProjectDto?.technologies,
      );
    }

    if (typeof updateProjectDto?.categories === 'string') {
      updateProjectDto.categories = JSON.parse(updateProjectDto?.categories);
    }
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
